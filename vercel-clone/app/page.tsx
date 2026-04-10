import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Box, Zap, Globe, Github } from "lucide-react";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-transparent text-zinc-100 font-sans selection:bg-white/10 selection:text-white relative flex flex-col justify-center overflow-hidden">

      {/* Background decorations - Monochrome */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/2 blur-[150px] rounded-full pointer-events-none" />

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        {/* Hero Section */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black border border-white/10 text-[10px] font-bold text-zinc-500 mb-10 backdrop-blur-md uppercase tracking-[0.3em]">
            <Zap className="w-3 h-3 text-white fill-white" />
            V 1.0.0 Deployment Engine
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-[0.9] uppercase italic">
            Engineered <br className="hidden md:block" />
            for <span className="text-zinc-500">Speed.</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto font-medium mb-12 leading-relaxed uppercase tracking-tight">
            Deployly provides the industrial-grade deployment infrastructure. Connect your repository, execute the build, and scale instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-10 h-14 bg-white text-black font-bold rounded-md flex items-center justify-center gap-3 hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-xl uppercase tracking-widest text-xs"
            >
              Start Building
              <ArrowRight size={14} />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              className="w-full sm:w-auto px-10 h-14 bg-black border border-white/5 text-zinc-400 font-bold rounded-md flex items-center justify-center gap-3 hover:bg-zinc-900 transition-colors uppercase tracking-widest text-xs"
            >
              <Github size={16} />
              Repository
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 border-t border-white/5 text-left">
          <div className="p-8 rounded-md bg-zinc-950/20 border border-white/5 hover:border-white/10 transition-all group">
             <div className="w-12 h-12 rounded-md bg-black border border-white/10 flex items-center justify-center mb-6 group-hover:border-white transition-colors">
               <Github className="w-5 h-5 text-white" />
             </div>
             <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-tight">Source Sync</h3>
             <p className="text-zinc-600 text-sm leading-relaxed uppercase font-medium tracking-tight text-[11px]">Push to main and instantly trigger a deployment. We automatically fetch your latest code from GitHub.</p>
          </div>
          <div className="p-8 rounded-md bg-zinc-950/20 border border-white/5 hover:border-white/10 transition-all group">
             <div className="w-12 h-12 rounded-md bg-black border border-white/10 flex items-center justify-center mb-6 group-hover:border-white transition-colors">
               <Box className="w-5 h-5 text-white" />
             </div>
             <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-tight">Isolated Builds</h3>
             <p className="text-zinc-600 text-sm leading-relaxed uppercase font-medium tracking-tight text-[11px]">Runs completely in secure, sandboxed AWS ECS containers via Docker, assuring consistent builds every time.</p>
          </div>
          <div className="p-8 rounded-md bg-zinc-950/20 border border-white/5 hover:border-white/10 transition-all group">
             <div className="w-12 h-12 rounded-md bg-black border border-white/10 flex items-center justify-center mb-6 group-hover:border-white transition-colors">
               <Globe className="w-5 h-5 text-white" />
             </div>
             <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-tight">Global Edge</h3>
             <p className="text-zinc-600 text-sm leading-relaxed uppercase font-medium tracking-tight text-[11px]">Assign custom domains instantly with automatic subdomains generated per project on the fly.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
