import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Github, Link as LinkIcon, Search, Lock, Globe } from "lucide-react";


function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
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

export default async function ImportPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/signin");
  }

  // Find github account for access token
  const githubAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "github" }
  });

  let repos: any[] = [];
  let error = null;

  if (githubAccount?.accessToken) {
    try {
      const res = await fetch("https://api.github.com/user/repos?visibility=public&sort=updated&per_page=100", {
        headers: {
          Authorization: `Bearer ${githubAccount.accessToken}`,
          Accept: "application/vnd.github.v3+json"
        }
      });
      if (res.ok) {
        repos = await res.json();
      } else {
        error = "Failed to fetch repositories from GitHub.";
      }
    } catch (e) {
      error = "Failed to connect to GitHub.";
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-10 space-y-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">Import Git Repository</h1>

      </div>

      <div className="space-y-6">
        {/* URL Import Mode */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-lg p-8 backdrop-blur-xl shadow-xl hover:border-white/20 transition-all">
           <div className="flex items-center gap-2 mb-6">
             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
             <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-[0.2em]">Quick Import via URL</h2>
           </div>

           <form action="/import/confirm" method="GET" className="flex gap-3">
              <div className="relative group/input flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-white transition-colors">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  name="url"
                  placeholder="https://github.com/username/repository"
                  className="w-full bg-black/60 border border-white/5 rounded-md py-3.5 pl-11 pr-4 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-white/40 transition-all font-medium selection:bg-white/10"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-zinc-100 text-black font-bold px-8 rounded-md hover:bg-white active:scale-95 transition-all text-sm uppercase tracking-wider"
              >
                Continue
              </button>
           </form>
        </div>

        {/* GitHub Repositories List */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-lg backdrop-blur-xl shadow-xl overflow-hidden">
           <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/5 rounded-md border border-white/5">
                   <Github className="w-4 h-4 text-zinc-100" />
                 </div>
                 <span className="text-xs font-bold text-zinc-100 uppercase tracking-[0.2em]">Your Repositories</span>
              </div>
              <div className="relative">
                 <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                 <input
                   type="text"
                   placeholder="Search repositories..."
                   className="bg-black/60 border border-white/5 rounded-md py-2 pl-9 pr-4 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-white/20 w-64 transition-all"
                 />
              </div>
           </div>

           <div className="max-h-[520px] overflow-y-auto custom-scrollbar">
              {!githubAccount ? (
                <div className="p-20 text-center space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-zinc-900 border border-white/5 mb-4">
                    <Search className="w-8 h-8 text-zinc-700" />
                  </div>
                  <p className="text-zinc-400 font-medium max-w-xs mx-auto">
                    Connect GitHub to see your repositories. (You logged in via another method)
                  </p>
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <div className="text-red-400/80 bg-red-400/5 py-3 px-6 rounded-md border border-red-400/10 inline-block font-medium">
                    {error}
                  </div>
                </div>
              ) : repos.length === 0 ? (
                <div className="p-20 text-center opacity-50">
                  <Globe className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500 font-medium">No public repositories found.</p>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {repos.map((repo) => (
                    <li key={repo.id} className="p-5 hover:bg-white/3 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-md bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-white/10 transition-colors">
                          <Globe className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <span className="font-bold text-zinc-200 group-hover:text-white transition-colors tracking-tight">
                              {repo.name}
                            </span>
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{repo.owner.login}</span>
                            {repo.private ? (
                              <Lock className="w-3 h-3 text-zinc-600" />
                            ) : null}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                            {repo.language && (
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                                <span>{repo.language}</span>
                              </div>
                            )}
                            <span className="opacity-20">|</span>
                            <span>Updated {formatTimeAgo(repo.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/import/confirm?url=${encodeURIComponent(repo.html_url)}`}
                        className="bg-zinc-100 hover:bg-white text-black font-bold text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-md transition-all active:scale-95 shadow-lg shadow-white/5"
                      >
                        Import
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
