"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Activity, Clock, FileCode2, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [prUrl, setPrUrl] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prUrl) return;

    // Parse GitHub PR URL to extract owner/repo/pull/number
    // e.g. https://github.com/vercel/next.js/pull/1234 -> /vercel/next.js/pull/1234
    try {
      let path = prUrl;
      if (prUrl.includes("github.com")) {
        const urlObj = new URL(prUrl.startsWith("http") ? prUrl : `https://${prUrl}`);
        path = urlObj.pathname;
      }
      // Ensure leading slash
      if (!path.startsWith("/")) path = `/${path}`;

      router.push(path);
    } catch (err) {
      // If it's not a valid URL but just a path like vercel/next.js/pull/123
      const path = prUrl.startsWith("/") ? prUrl : `/${prUrl}`;
      router.push(path);
    }
  };

  const recentReviews = [
    { repo: "vercel/next.js", pr: "#54321", title: "Optimize image loader", status: "completed", time: "2h ago" },
    { repo: "facebook/react", pr: "#2819", title: "Fix concurrent mode bug", status: "completed", time: "5h ago" },
    { repo: "tailwindlabs/tailwindcss", pr: "#994", title: "Add new typography variants", status: "in-progress", time: "1d ago" }
  ];

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center">
      <div className="hero-gradient" />

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center p-6 lg:px-12 max-w-7xl mx-auto z-10">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-500 w-6 h-6" />
          <span className="text-xl font-semibold tracking-tight">Assess<span className="text-blue-500">.ai</span></span>
        </div>
        <div className="flex gap-4 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="/settings" className="hover:text-white transition-colors">Settings</a>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-4xl mx-auto px-6 pt-24 pb-12 flex flex-col items-center z-10">

        {/* Hero Concept */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-xs text-blue-400 mb-6 uppercase tracking-widest font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Agentic Code Review
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            Review code with <br className="hidden md:block" /> infinite context
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Paste a GitHub PR link or swap <span className="text-white font-mono bg-white/10 px-1 rounded">github.com</span> for <span className="text-white font-mono bg-blue-500/20 text-blue-400 px-1 rounded">assess.ai</span> to instantly get actionable, high-signal feedback.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-2xl relative"
        >
          <form onSubmit={handleSubmit} className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${isHovering ? 'opacity-50 duration-200' : ''}`}></div>
            <div className="relative flex items-center bg-[#0f1115] border border-white/10 rounded-2xl overflow-hidden focus-within:border-blue-500/50 transition-colors">
              <div className="pl-6 pr-2 py-4 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                onFocus={() => setIsHovering(true)}
                onBlur={() => setIsHovering(false)}
                placeholder="https://github.com/owner/repo/pull/123"
                className="w-full bg-transparent border-none text-white text-lg placeholder-slate-600 focus:outline-none py-5"
              />
              <button
                type="submit"
                className="mx-3 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                Assess <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Recent Reviews grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="w-full mt-24"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" /> Recent Reviews
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentReviews.map((review, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-white/5 rounded-lg text-blue-400">
                    <FileCode2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-white/5 text-slate-300">
                    {review.time}
                  </span>
                </div>
                <h4 className="font-semibold text-lg text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{review.title}</h4>
                <p className="text-sm text-slate-400 font-mono mb-4">{review.repo}{review.pr}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                  <span className="text-slate-300 capitalize">{review.status.replace('-', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
