"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { FolderGit2, Loader2, Rocket, ArrowLeft, Settings2 } from "lucide-react";
import { deployProject } from "@/actions/deploy";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url");
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!url) {
    return (
      <div className="text-center py-24">
        <h2 className="text-xl font-bold text-white mb-4">No Repository Provided</h2>
        <Link href="/import" className="text-zinc-400 hover:text-white transition-colors underline">
          Go back to Import
        </Link>
      </div>
    );
  }

  const repoName = url.split('/').pop()?.replace('.git', '') || "Unknown Repository";

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    try {
      const result = await deployProject(url);
      router.push(`/deploy/${result.projectSlug}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start deployment. Please try again.");
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/import" className="group inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-white transition-all mb-12">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Source
      </Link>

      <div className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Import Project</h1>
        <p className="text-zinc-500 text-sm font-medium">Review your build configuration for <span className="text-zinc-300 font-semibold">{repoName}</span></p>
      </div>

      <div className="bg-zinc-950/40 border border-white/5 rounded-xl p-10 backdrop-blur-3xl shadow-2xl space-y-12">
        {/* Project Info */}
        <div className="flex items-center gap-6 pb-12 border-b border-white/5">
          <div className="w-16 h-16 rounded-lg bg-black border border-white/10 flex items-center justify-center">
            <FolderGit2 className="w-6 h-6 text-zinc-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white tracking-tight">{repoName}</h2>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
               <span className="opacity-50">Source:</span>
               <a href={url} target="_blank" className="hover:text-white transition-colors border-b border-white/5 pb-0.5">
                 {url.replace('https://github.com/', '')}
               </a>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-6">
          <h3 className="text-xs font-semibold text-zinc-400 flex items-center gap-3">
            <Settings2 size={14} className="text-white" />
            Build Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-black/40 border border-white/5 p-6 rounded-lg">
              <span className="block text-zinc-600 mb-2 text-[10px] font-bold uppercase tracking-wider">Runtime Engine</span>
              <span className="text-sm font-medium text-white tracking-tight">Docker / OCI Image</span>
            </div>
            <div className="bg-black/40 border border-white/5 p-6 rounded-lg">
              <span className="block text-zinc-600 mb-2 text-[10px] font-bold uppercase tracking-wider">Git Branch</span>
              <span className="text-sm font-medium text-white tracking-tight">main</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        <div className="pt-6">
          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="w-full bg-white text-black font-semibold h-12 rounded-lg flex items-center justify-center gap-3 hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-sm"
          >
            {isDeploying ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Deploying...
              </>
            ) : (
              <>
                <Rocket size={18} />
                Deploy Project
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-zinc-500 animate-pulse">Loading settings...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}
