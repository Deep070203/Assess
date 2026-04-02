"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Activity, Clock, FileCode2, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
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

  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/recent-reviews')
      .then(res => res.json())
      .then(data => setRecentReviews(data))
      .catch(e => console.error(e));
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center bg-gradient-to-br from-emerald-50 via-white to-orange-50 text-emerald-950">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center p-6 lg:px-12 max-w-7xl mx-auto z-10">
        <div className="flex items-center gap-2">
          <Activity className="text-emerald-600 w-6 h-6" />
          <span className="text-xl font-bold tracking-tight text-emerald-950">Assess<span className="text-orange-500">.ai</span></span>
        </div>
        <div className="flex gap-4 items-center text-sm font-medium text-emerald-700/80">
          <a href="#" className="hover:text-emerald-900 transition-colors">Documentation</a>
          {session ? (
            <div className="flex items-center gap-3 ml-2">
              <Link href="/dashboard" className="px-4 py-2 rounded-full bg-white border border-emerald-200 shadow-sm text-emerald-900 hover:border-emerald-300 transition-colors">Dashboard</Link>
              <Link href="/profile" className="hover:opacity-80 transition-opacity">
                <img src={session.user?.image || ""} className="w-8 h-8 rounded-full border border-emerald-200" alt="Avatar" />
              </Link>
            </div>
          ) : (
            <button onClick={() => signIn("github", { callbackUrl: "/dashboard" })} className="px-4 py-2 rounded-full bg-white border border-emerald-200 shadow-sm text-emerald-900 hover:border-emerald-300 transition-colors">Sign In</button>
          )}
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-200 shadow-sm text-xs text-orange-600 mb-6 uppercase tracking-widest font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Agentic Code Review
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 to-emerald-700">
            Review code with <br className="hidden md:block" /> infinite context
          </h1>
          <p className="text-lg md:text-xl text-emerald-800/80 max-w-2xl mx-auto font-medium">
            Paste a GitHub PR link or swap <span className="text-emerald-900 font-mono bg-white border border-emerald-200 px-1.5 rounded">github.com</span> for <span className="text-orange-700 font-mono bg-orange-100 border border-orange-200 px-1.5 rounded">assess.ai</span> to instantly get actionable, high-signal feedback.
          </p>
        </motion.div>

        {/* Auth CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full max-w-lg mb-12 relative z-20"
        >
          {status === "loading" ? (
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          ) : session ? (
            <button onClick={() => router.push("/dashboard")} className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-colors flex items-center gap-3 text-lg w-full sm:w-auto shadow-xl shadow-emerald-600/20">
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={() => signIn("github", { callbackUrl: "/dashboard" })} className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-colors flex items-center gap-3 text-lg w-full sm:w-auto shadow-xl shadow-emerald-600/20 border border-emerald-400/50">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"></path></svg>
              Login with GitHub
            </button>
          )}
        </motion.div>

        {/* Recent Reviews grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="w-full mt-24"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-900">
              <Clock className="w-5 h-5 text-orange-500" /> Recent Reviews
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentReviews.map((review, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl cursor-pointer group border border-emerald-100 shadow-xl shadow-orange-900/5 hover:border-orange-300 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <FileCode2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-50 text-orange-600">
                    {review.time}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-emerald-900 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-1">{review.title}</h4>
                <p className="text-sm text-emerald-700/70 font-mono mb-4">{review.repo}{review.pr}</p>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className={`flex h-2 w-2 rounded-full ${review.status === 'completed' ? 'bg-emerald-500' : 'bg-orange-400'}`}></span>
                  <span className="text-emerald-800 capitalize">{review.status.replace('-', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-emerald-100 py-10 mt-12 z-20 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="text-emerald-600 w-5 h-5" />
            <span className="text-lg font-bold tracking-tight text-emerald-950">Assess<span className="text-orange-500">.ai</span></span>
          </div>
          <p className="text-emerald-700/70 text-sm font-medium">© {new Date().getFullYear()} Assess.ai. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-bold text-emerald-800">
            <a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-orange-500 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
