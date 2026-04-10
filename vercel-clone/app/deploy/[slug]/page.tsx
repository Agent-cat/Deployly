"use client";

import { useState, useEffect, useRef, useReducer } from "react";
import { io, Socket } from "socket.io-client";
import { Terminal, Globe, Rocket, CheckCircle2, AlertCircle, Loader2, ArrowLeft, ExternalLink, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProjectStatus } from "@/actions/status";

export default function DeploymentPage() {
  const { slug } = useParams() as { slug: string };
  const [status, setStatus] = useState<"deploying" | "ready" | "error">("deploying");
  const [logs, dispatchLogs] = useReducer((state: string[], action: { type: 'add', payload: string } | { type: 'clear' }) => {
    switch (action.type) {
      case 'add':
        const newState = [...state, action.payload];
        return newState.length > 5000 ? newState.slice(-5000) : newState;
      case 'clear':
        return [];
      default:
        return state;
    }
  }, []);
  const logEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000";
  const deployedURL = `http://${slug}.${baseUrl}`;

  useEffect(() => {
    const scroll = () => logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const timeoutId = setTimeout(scroll, 100);
    return () => clearTimeout(timeoutId);
  }, [logs]);

  // Status Polling for DB check (Backup for Socket)
  useEffect(() => {
    if (!slug || status === "ready") return;

    const interval = setInterval(async () => {
      try {
        const result = await getProjectStatus(slug);
        if (result.status === "READY") {
          setStatus("ready");
          clearInterval(interval);
        } else if (result.status === "FAIL") {
          setStatus("error");
          clearInterval(interval);
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [slug, status]);

  useEffect(() => {
    if (!slug) return;

    const socket = io("http://localhost:9001");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("subscribe", `logs:${slug}`);
    });

    socket.on("message", (msg: string) => {
      let logText = msg;
      try {
        const parsed = JSON.parse(msg);
        logText = parsed.log || msg;
      } catch (e) {
        // Not JSON, use as is
      }

      dispatchLogs({ type: 'add', payload: logText });
      const lowerMsg = logText.toLowerCase();
      if (lowerMsg.includes("done") || lowerMsg.includes("success") || lowerMsg.includes("deployment ready")) {
         setStatus("ready");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [slug]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-16">
        <div className="space-y-6">
           <Link href="/dashboard" className="group inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-white transition-all">
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
             Back to Dashboard
           </Link>

           <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-white">
                Build <span className="text-zinc-600 font-light mx-1">/</span> <span className="text-zinc-400">#{slug.split('-').slice(0, 2).join('')}</span>
              </h1>
              <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
                <div className="flex items-center gap-2 uppercase tracking-widest text-[10px]">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                   {slug}
                </div>
                <div className="w-px h-3 bg-zinc-800" />
                <span>Production Deployment</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-4">
           {status === "deploying" ? (
             <div className="flex items-center gap-3 text-white bg-white/5 px-6 py-2.5 rounded-full text-xs font-medium border border-white/10 shadow-xl">
               <Loader2 className="w-3.5 h-3.5 animate-spin" />
               Processing Build
             </div>
           ) : status === "ready" ? (
             <div className="flex items-center gap-3 text-black bg-white px-6 py-2.5 rounded-full text-xs font-semibold shadow-lg shadow-white/5">
               <CheckCircle2 className="w-3.5 h-3.5" />
               System Ready
             </div>
           ) : (
            <div className="flex items-center gap-3 text-zinc-400 bg-zinc-900 px-6 py-2.5 rounded-full text-xs font-medium border border-white/5">
              <AlertCircle className="w-3.5 h-3.5" />
              Build Failed
            </div>
           )}
        </div>
      </div>

      <div className="flex flex-col gap-10">

        {/* Top: Preview Section */}
        <div className="w-full">
           <div className="bg-zinc-950/40 border border-white/5 rounded-xl overflow-hidden shadow-2xl relative group/preview backdrop-blur-xl transition-all hover:border-white/10">
              {/* URL Bar */}
              <div className="bg-black/60 backdrop-blur-3xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
                 <div className="flex items-center gap-6 flex-1">
                    <div className="flex gap-1.5">
                       <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white/5" />
                       <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white/5" />
                       <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white/5" />
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-lg px-4 py-1.5 flex items-center gap-3 flex-1 max-w-lg transition-colors group-focus-within/preview:border-white/20">
                       <Globe className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                       <span className="text-xs font-medium text-zinc-500 truncate">{deployedURL}</span>
                    </div>
                 </div>
                 <a
                   href={deployedURL}
                   target="_blank"
                   className={cn(
                     "flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                     status === "ready" ? "bg-white text-black hover:bg-zinc-200" : "bg-white/5 text-zinc-700 pointer-events-none border border-white/5"
                   )}
                 >
                   Launch
                   <ExternalLink size={12} />
                 </a>
              </div>

              <div className="aspect-video flex items-center justify-center p-6 bg-black/40 relative">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent)] pointer-events-none" />

                 <AnimatePresence mode="wait">
                    {status === "deploying" ? (
                      <motion.div
                        key="deploying"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full"
                      >
                         <div className="w-full h-full rounded-md border border-white/5 bg-zinc-900/10 overflow-hidden relative p-8 space-y-8">
                            <div className="flex items-center gap-4 animate-pulse">
                               <div className="w-12 h-12 rounded-lg bg-white/5" />
                               <div className="space-y-2">
                                  <div className="w-32 h-3 rounded-full bg-white/5" />
                                  <div className="w-20 h-2 rounded-full bg-white/5" />
                               </div>
                            </div>

                            <div className="space-y-4 animate-pulse">
                               <div className="w-full h-32 rounded-lg bg-white/5" />
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="w-full h-24 rounded-lg bg-white/5" />
                                  <div className="w-full h-24 rounded-lg bg-white/5" />
                                </div>
                               <div className="space-y-2">
                                  <div className="w-full h-2 rounded-full bg-white/5" />
                                  <div className="w-full h-2 rounded-full bg-white/5" />
                                  <div className="w-2/3 h-2 rounded-full bg-white/5" />
                               </div>
                            </div>

                            {/* Floating Status */}
                            <div className="absolute inset-0 flex items-center justify-center">
                               <div className="flex items-center gap-3 bg-black/80 backdrop-blur-xl px-8 py-4 rounded-lg border border-white/10 shadow-3xl transform -translate-y-4">
                                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                                  <div className="flex flex-col">
                                     <span className="text-[10px] font-bold text-white tracking-widest uppercase">Provisioning</span>
                                     <span className="text-[9px] text-zinc-500 font-medium">Environment preparing...</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    ) : status === "ready" ? (
                      <motion.div
                        key="ready"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full"
                      >
                         <a
                           href={deployedURL}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-full h-full block group/preview-link"
                         >
                            <div className="w-full h-full rounded-lg overflow-hidden border border-white/5 bg-white relative shadow-2xl">
                               <iframe
                                  src={deployedURL}
                                  title="Preview"
                                  className="w-full h-full border-0 absolute inset-0 bg-white pointer-events-none"
                               />
                               {/* Interactive Overlay */}
                               <div className="absolute inset-0 bg-black/0 group-hover/preview-link:bg-black/60 transition-all duration-500 flex items-center justify-center">
                                  <div className="opacity-0 group-hover/preview-link:opacity-100 translate-y-4 group-hover/preview-link:translate-y-0 transition-all duration-500 bg-white text-black px-8 py-3 rounded-lg text-xs font-bold flex items-center gap-3 shadow-2xl">
                                     Open Live Site
                                     <ExternalLink size={14} />
                                  </div>
                               </div>
                            </div>
                         </a>
                      </motion.div>
                    ) : (
                      <motion.div key="error" className="text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-md flex items-center justify-center mx-auto mb-6 text-zinc-600 border border-white/5">
                           <AlertCircle size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Build Failed</h3>
                        <p className="text-zinc-500 text-sm mb-6">Check the logs below for details.</p>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>

        {/* Bottom: Logs Section */}
        <div className="w-full bg-zinc-950/40 border border-white/5 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col h-[700px] transition-all hover:border-white/10">
          <div className="bg-black/80 px-8 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                <Terminal size={14} className="text-white" />
              </div>
               <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-white tracking-widest uppercase">Build Logs</span>
                  <span className="text-[9px] text-zinc-600 font-medium">Real-time output</span>
               </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                 Active
               </div>
               <div className="w-px h-8 bg-white/5" />
               <div className="flex gap-3">
                 <div className="w-2 h-2 rounded-full bg-zinc-900" />
                 <div className="w-2 h-2 rounded-full bg-zinc-900" />
               </div>
            </div>
          </div>
          <div className="p-10 flex-1 overflow-y-auto font-mono text-[12px] space-y-2 selection:bg-white/10 custom-scrollbar bg-black/20">
            {logs.length === 0 && (
              <div className="space-y-3 animate-pulse">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="flex gap-8 group/line items-center opacity-30">
                    <div className="w-8 h-2 bg-zinc-800 rounded-full shrink-0" />
                    <div className={cn(
                      "h-2 bg-zinc-800 rounded-full",
                      i % 3 === 0 ? "w-[60%]" : i % 2 === 0 ? "w-[40%]" : "w-[75%]"
                    )} />
                  </div>
                ))}
              </div>
            )}
            {logs.map((log, i) => (
              <div key={i} className="flex gap-8 group/line">
                <span className="text-zinc-800 select-none w-10 text-right pr-4 border-r border-white/5 group-hover/line:text-zinc-600 transition-colors shrink-0 tabular-nums font-bold text-[10px]">
                  {(i + 1).toString().padStart(3, '0')}
                </span>
                <span className={cn(
                  "transition-colors break-all whitespace-pre-wrap leading-relaxed py-0.5",
                  log.toLowerCase().includes("error") ? "text-white font-bold bg-white/5 px-2 rounded-sm" :
                  log.toLowerCase().includes("done") || log.toLowerCase().includes("success") ? "text-white font-black" :
                  "text-zinc-500 group-hover/line:text-zinc-300"
                )}>
                  {log}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
}
