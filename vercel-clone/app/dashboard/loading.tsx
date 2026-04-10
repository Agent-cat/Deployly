import { Search, Plus } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
      {/* Header Controls Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="h-9 w-48 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-64 h-11 bg-white/5 rounded-lg animate-pulse" />
          <div className="w-32 h-11 bg-white/20 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-zinc-950/40 border border-white/5 rounded-xl p-10 h-[280px] flex flex-col justify-between backdrop-blur-xl animate-pulse">
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-lg bg-white/5" />
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-white/5 rounded-full" />
                  <div className="w-20 h-2 bg-white/5 rounded-full" />
                </div>
              </div>
              <div className="w-48 h-3 bg-white/5 rounded-full" />
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-8">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white/5" />
                  <div className="w-16 h-2 bg-white/5 rounded-full" />
               </div>
               <div className="w-12 h-2 bg-white/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
