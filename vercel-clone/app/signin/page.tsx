"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-transparent px-4 overflow-hidden relative selection:bg-white/10 selection:text-white">
      <div className="relative group w-full max-w-sm">
        <div className="absolute -inset-px bg-white/5 rounded-md opacity-25 group-hover:opacity-50 transition-opacity" />
        <Card className="relative bg-zinc-950/50 border border-white/5 rounded-md backdrop-blur-2xl shadow-2xl overflow-hidden">
          <CardHeader className="space-y-6 text-center pb-10 pt-12">
            <div className="mx-auto w-12 h-12 bg-white rounded-md flex items-center justify-center shadow-lg shadow-white/5">
               <span className="text-black font-black text-2xl select-none">D</span>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-white uppercase tracking-tighter">Welcome back</CardTitle>
              <CardDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                Secure Access Portal
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 px-8 pb-8">
            <Button
              variant="outline"
              onClick={handleSignIn}
              className="w-full py-6 text-xs font-bold uppercase tracking-[0.2em] bg-white text-black hover:bg-zinc-200 border-none transition-all active:scale-[0.98] rounded-md group"
            >
              <Github className="mr-3 h-4 w-4" />
              Github Login
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-8 text-center text-sm pb-12 pt-4">
            <div className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
              No account?{" "}
              <Link href="/signup" className="text-white hover:underline underline-offset-4 decoration-white/20">
                Create one
              </Link>
            </div>
            <p className="text-[10px] px-8 text-zinc-700 uppercase tracking-widest font-medium leading-relaxed max-w-[280px] mx-auto">
              Access signifies agreement with our <br />
              <span className="text-zinc-500 hover:text-white cursor-pointer transition-colors">Legal Terms</span>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
