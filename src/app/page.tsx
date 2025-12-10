"use client";

import { authClient } from "@/lib/auth-client";
import { ArrowRight, Brain, Zap, Globe, Database, Bot } from "lucide-react";

export default function LandingPage() {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neutral-900 rounded-md flex items-center justify-center text-white font-bold text-xs">
              P
            </div>
            <span className="font-bold tracking-tight text-lg">
              PersonaPost
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogin}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={handleLogin}
              className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 border-b border-neutral-100 overflow-hidden">
        {/* Background Grid Pattern (CSS CSS) */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size-6rem_4rem]"></div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_800px_at_50%_200px,#ffffff,transparent)]"></div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-50 border border-neutral-200 text-[10px] font-medium uppercase tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Powered by Gemini 3
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-600">
            Social media on autopilot.
            <br />
            <span className="text-neutral-900">Without losing your voice.</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop writing generic posts. PersonaPost analyzes your website,
            learns your unique tone, and generates daily content using advanced
            RAG technology.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLogin}
              className="group h-12 px-8 rounded-full bg-neutral-900 text-white font-medium flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
            >
              Start Generating Free
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <a
              href="https://github.com"
              target="_blank"
              className="h-12 px-8 rounded-full border border-neutral-200 bg-white text-neutral-600 font-medium flex items-center gap-2 hover:bg-neutral-50 transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (Bento Grid) --- */}
      <section className="py-24 px-6 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Sophisticated Engineering.
            </h2>
            <p className="text-neutral-500 max-w-xl">
              Built with the modern stack. We use Vector Search and Large
              Language Models to create content that actually sounds like you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Retrieval */}
            <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Database size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">1. Vector Retrieval</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                We scrape your site and store it in MongoDB Atlas Vector Search.
                Your content is converted into 768-dimensional embeddings for
                semantic understanding.
              </p>
            </div>

            {/* Card 2: Generation */}
            <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6">
                <Brain size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">2. Context Injection</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                We don&apos;t just prompt. We inject your specific brand voice
                data into Google&apos;s Gemini 3 Pro model to ensure
                high-fidelity output.
              </p>
            </div>

            {/* Card 3: Automation */}
            <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 mb-6">
                <Bot size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">3. Automated Agents</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Set it and forget it. Our Vercel Cron Jobs run daily agents that
                draft content while you sleep, scaling to thousands of users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- TECH STACK STRIP --- */}
      <section className="py-12 border-y border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-mono text-neutral-400 uppercase tracking-widest mb-8">
            Built with the Next Generation Stack
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Tech Labels for Portfolio flex */}
            <span className="flex items-center gap-2 font-bold text-lg">
              <Zap size={20} /> Next.js 15
            </span>
            <span className="flex items-center gap-2 font-bold text-lg">
              <Database size={20} /> MongoDB Atlas
            </span>
            <span className="flex items-center gap-2 font-bold text-lg">
              <Brain size={20} /> Google Gemini
            </span>
            <span className="flex items-center gap-2 font-bold text-lg">
              <Globe size={20} /> Vercel
            </span>
            <span className="flex items-center gap-2 font-bold text-lg">
              BetterAuth
            </span>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-neutral-900 rounded flex items-center justify-center text-white font-bold text-[10px]">
              P
            </div>
            <span className="font-bold text-sm">PersonaPost</span>
          </div>
          <p className="text-sm text-neutral-400">
            © 2025 PersonaPost. Open Source Portfolio Project.
          </p>
        </div>
      </footer>
    </div>
  );
}
