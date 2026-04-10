"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Github } from "lucide-react";


export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();

  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                window.location.reload();
            }
        }
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background shadow-2xl backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-6 mx-auto max-w-7xl">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2.5 transition-opacity hover:opacity-90">
            <span className="hidden font-bold text-xl tracking-tight sm:inline-block bg-linear-to-br from-white to-zinc-500 bg-clip-text text-transparent">
              Deployly
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {isPending ? (
            <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
          ) : session ? (
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative h-8 w-8 rounded-md ring-1 ring-white/5 overflow-hidden")}>
                  <Avatar className="h-8 w-8 rounded-none">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name} />
                    <AvatarFallback className="rounded-none bg-zinc-900 text-[10px] font-bold">{session.user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-md bg-zinc-950 border-white/5 shadow-2xl">
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1.5">{session.user.name}</p>
                    <p className="text-[11px] font-medium text-zinc-400 truncate tracking-tight">{session.user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={handleSignOut} className="text-xs font-bold uppercase tracking-widest text-zinc-500 focus:bg-white focus:text-black hover:cursor-pointer">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/signin" className={cn(buttonVariants({ variant: "ghost" }), "text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors")}>
                Log In
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ variant: "default" }), "text-[11px] font-bold uppercase tracking-widest bg-white text-black rounded-md px-6 hover:bg-zinc-200 transition-all")}>
                Sign Up
              </Link>
            </div>

          )}
        </div>
      </div>
    </nav>
  );
}
