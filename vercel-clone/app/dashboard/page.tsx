import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Github, ExternalLink, Clock, FolderGit2, Loader2, CheckCircle2, AlertCircle, Search } from "lucide-react";


function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "just now";
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/signin");
  }

  // Fetch projects and sum up latest deployment
  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      deployments: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });



  const getStatusIcon = (status: string) => {
    switch(status) {
      case "READY": return <CheckCircle2 className="w-4 h-4 text-white" />;
      case "FAIL": return <AlertCircle className="w-4 h-4 text-zinc-700" />;
      case "IN_PROGRESS":
      case "QUEUED": return <Loader2 className="w-4 h-4 text-zinc-500 animate-spin-slow" />;
      default: return <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />;
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-zinc-500 text-sm font-medium">Manage and monitor your deployments.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group/search">
            <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within/search:text-white transition-colors" />
            <input
              type="text"
              placeholder="Search projects..."
              className="bg-black/60 border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all w-64 font-medium"
            />
          </div>
          <Link href="/import" className="bg-white text-black font-semibold rounded-lg px-6 py-2.5 flex items-center gap-2 hover:bg-zinc-200 active:scale-95 transition-all text-xs shadow-lg shadow-white/5">
            <Plus className="w-3.5 h-3.5" />
            New Project
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.length === 0 ? (
           <div className="col-span-full bg-zinc-900/40 border border-white/5 rounded-xl p-24 text-center flex flex-col items-center justify-center border-dashed backdrop-blur-xl">
              <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-8">
                <FolderGit2 className="w-8 h-8 text-zinc-700" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">No active pipelines</h3>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-10 leading-relaxed font-medium">
                Connect your repository to establish a high-performance deployment environment.
              </p>
              <Link href="/import" className="bg-white text-black font-semibold rounded-lg px-10 py-4 text-xs hover:bg-zinc-200 transition-all shadow-2xl">
                Initialize Repository
              </Link>
           </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="group relative">
              <div className="bg-zinc-950/40 border border-white/5 rounded-xl p-10 hover:border-white/20 transition-all h-full flex flex-col justify-between relative backdrop-blur-xl shadow-2xl overflow-hidden">
                <Link href={`/deploy/${project.subdomain}`} className="absolute inset-0 z-0" />

                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 blur-3xl rounded-full translate-x-16 -translate-y-16 group-hover:bg-white/5 transition-colors" />

                <div className="relative z-10 pointer-events-none">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-lg bg-black border border-white/5 flex items-center justify-center group-hover:border-white/10 transition-colors">
                        <FolderGit2 className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white group-hover:text-white transition-colors leading-none mb-2 tracking-tight">
                          {project.name}
                        </h2>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest leading-none">{project.subdomain}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <a
                    href={project.gitURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[10px] font-medium text-zinc-500 hover:text-white uppercase tracking-[0.2em] transition-colors mb-10 w-fit pointer-events-auto"
                  >
                    <Github size={12} className="opacity-30" />
                    {project.gitURL.replace('https://github.com/', '')}
                  </a>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-8 relative z-10 pointer-events-none">
                  <div className="flex items-center gap-3">
                     <div className="shrink-0 flex items-center justify-center">
                       {project.deployments[0] ? (
                         project.deployments[0].status === "READY" ? <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" /> :
                         project.deployments[0].status === "FAIL" ? <AlertCircle className="w-4 h-4 text-zinc-800" /> :
                         <Loader2 className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
                       ) : <div className="w-2 h-2 rounded-full bg-zinc-900" />}
                     </div>
                     <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                       {project.deployments[0]?.status.replace('_', ' ') || 'Idle'}
                     </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-zinc-700 ml-auto group-hover:text-zinc-500 transition-colors">
                    <Clock size={10} />
                    {timeAgo(project.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
