"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthBackground } from "@/components/AuthBackground";

export default function SignInPage() {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-20">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center space-y-3">

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Welcome back
          </h1>
          <p className="text-zinc-400 text-sm font-medium">
            Sign in to your Deployly account to continue
          </p>
        </div>

        <Card className="border-white/[0.08] bg-zinc-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          {/* Subtle top border illumination */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardHeader className="space-y-1 pb-4 pt-8 text-center">
            <CardTitle className="text-xl font-semibold text-white">Identity Verification</CardTitle>
            <CardDescription className="text-zinc-500 text-xs uppercase tracking-[0.2em] font-bold">
              Secure Github OAuth
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 px-8 pb-8">
            <Button
              variant="outline"
              onClick={handleSignIn}
              className="w-full h-12 text-sm font-semibold bg-white text-black hover:bg-zinc-200 border-none transition-all active:scale-[0.98] rounded-xl group relative overflow-hidden"
            >
              <span className="flex items-center justify-center gap-3">
                <Github className="h-5 w-5" />
                Continue with GitHub
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-6 text-center pb-8">
            <p className="text-zinc-500 text-sm font-medium">
              New to the platform?{" "}
              <Link href="/signup" className="text-white hover:text-zinc-300 transition-colors font-semibold decoration-white/20 underline-offset-4 underline">
                Create an account
              </Link>
            </p>

          </CardFooter>
        </Card>

        {/* Status indicators */}

      </motion.div>
    </div>
  );
}
