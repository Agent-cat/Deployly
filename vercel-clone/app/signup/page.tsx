"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthBackground } from "@/components/AuthBackground";

export default function SignUpPage() {
  const handleSignUp = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-20">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center space-y-3">

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Join Deployly
          </h1>
          <p className="text-zinc-400 text-sm font-medium">
            Start deploying your futuristic apps today
          </p>
        </div>

        <Card className="border-white/[0.08] bg-zinc-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          {/* Animated gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <CardHeader className="space-y-1 pb-4 pt-8 text-center">
            <CardTitle className="text-xl font-semibold text-white">Create Account</CardTitle>
            <CardDescription className="text-zinc-500 text-xs uppercase tracking-[0.2em] font-bold">
              Instant Github Onboarding
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 px-8 pb-8">
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={handleSignUp}
                className="w-full h-12 text-sm font-semibold bg-white text-black hover:bg-zinc-200 border-none transition-all active:scale-[0.98] rounded-xl group relative"
              >
                <span className="flex items-center justify-center gap-3">
                  <Github className="h-5 w-5" />
                  Sign up with GitHub
                </span>
                <div className="absolute -top-1 -right-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-100"></span>
                  </span>
                </div>
              </Button>

              
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-zinc-500 font-medium tracking-widest">
                  Secure & Private
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-6 text-center pb-8">
            <p className="text-zinc-500 text-sm font-medium">
              Already a member?{" "}
              <Link href="/signin" className="text-white hover:text-zinc-300 transition-colors font-semibold decoration-white/20 underline-offset-4 underline">
                Sign in here
              </Link>
            </p>

          </CardFooter>
        </Card>

        {/* Developer badges */}

      </motion.div>
    </div>
  );
}
