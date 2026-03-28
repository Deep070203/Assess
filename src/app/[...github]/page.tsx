"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertCircle, FileCode2, MessagesSquare, ThumbsUp, ThumbsDown, Columns, AlignLeft } from "lucide-react";
import Link from "next/link";
import { DiffViewer } from "@/components/DiffViewer";

export default function PRReviewPage({ params }: { params: Promise<{ github: string[] }> }) {
    const resolvedParams = use(params);
    // Expected: owner/repo/pull/123
    const owner = resolvedParams.github[0] || "owner";
    const repo = resolvedParams.github[1] || "repo";
    const number = resolvedParams.github[3] || "123";

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [aiData, setAiData] = useState<any>(null);
    const [diffViewMode, setDiffViewMode] = useState<"inline" | "split">("inline");

    useEffect(() => {
        const cacheKey = `assess_review_${owner}_${repo}_${number}`;

        async function fetchReview() {
            try {
                setIsLoading(true);
                const res = await fetch("/api/review", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ owner, repo, pullNumber: number })
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Failed to fetch review");

                setAiData(data);
                localStorage.setItem(cacheKey, JSON.stringify(data));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            try {
                setAiData(JSON.parse(cachedData));
                setIsLoading(false);
            } catch (e) {
                fetchReview();
            }
        } else {
            fetchReview();
        }
    }, [owner, repo, number]);

    return (
        <main className="min-h-screen bg-[#0b0c10] text-[#f8fafc] flex flex-col">
            {/* Top Navbar */}
            <nav className="w-full border-b border-white/10 bg-[#0f1115] p-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-sm font-mono text-slate-400">
                            <span>{owner}</span> / <span className="text-white">{repo}</span>
                        </div>
                        <h1 className="text-lg font-semibold flex items-center gap-2 mt-0.5">
                            PR #{number} <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 ml-2">Review Complete</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-3">
                    <a href={`https://github.com/${owner}/${repo}/pull/${number}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-sm font-medium rounded-lg transition-colors border border-white/10 hidden sm:block">
                        View on GitHub
                    </a>
                    <button onClick={() => { localStorage.removeItem(`assess_review_${owner}_${repo}_${number}`); window.location.reload(); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                        Re-run Review
                    </button>
                </div>
            </nav>

            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative w-16 h-16 mb-6">
                        <div className="absolute inset-0 rounded-full border-2 border-slate-800"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                    <h2 className="text-xl font-medium mb-2">Analyzing Pull Request</h2>
                    <p className="text-slate-400 animate-pulse text-sm">Building repository graph context and generating feedback...</p>
                </div>
            ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-xl font-medium mb-2 text-white">Review Failed</h2>
                    <p className="text-slate-400 max-w-md">{error}</p>
                    <Link href="/" className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 text-sm rounded-lg transition-colors">
                        Go Back
                    </Link>
                </div>
            ) : (
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                    {/* Left Column: AI Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full md:w-[400px] lg:w-[450px] border-r border-white/10 bg-[#0f1115]/50 overflow-y-auto p-6"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            <h2 className="text-xl font-semibold tracking-tight">AI Assessment</h2>
                        </div>

                        <div className="glass-panel p-5 rounded-xl mb-6">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Executive Summary</h3>
                            <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                {aiData?.summary || "No summary provided by the agent."}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs font-medium">
                                <span className="px-2.5 py-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Context Parsed
                                </span>
                                <span className="px-2.5 py-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" /> {(aiData?.feedback || []).length} Findings
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Actionable Feedback</h3>

                            {/* Comment Cards */}
                            {(aiData?.feedback || []).map((item: any, i: number) => (
                                <div key={i} className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/10 rounded-xl p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                                            <FileCode2 className="w-4 h-4 text-blue-400" /> {item.file}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${item.severity === 'High Signal' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {item.severity || "Issue"}
                                        </span>
                                    </div>
                                    <p className="text-sm mb-4 text-slate-200 leading-relaxed">
                                        {item.comment}
                                    </p>
                                    <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-xs text-slate-300 mb-4 overflow-x-auto whitespace-pre">
                                        {item.originalCode && <div className="text-red-400/80 mb-2">- {item.originalCode}</div>}
                                        {item.suggestedCode && <div className="text-green-400">+ {item.suggestedCode}</div>}
                                    </div>

                                    {/* Learning System Feedback */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                        <span className="text-xs font-medium text-slate-500">Tune this rule:</span>
                                        <div className="flex gap-1">
                                            <button className="px-3 py-1.5 bg-white/5 hover:bg-green-500/20 rounded border border-white/5 hover:border-green-500/30 text-slate-400 hover:text-green-400 transition-all flex items-center gap-1.5 text-xs font-medium">
                                                <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                                            </button>
                                            <button className="px-3 py-1.5 bg-white/5 hover:bg-red-500/20 rounded border border-white/5 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all flex items-center gap-1.5 text-xs font-medium">
                                                <ThumbsDown className="w-3.5 h-3.5" /> Nitpick
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </motion.div>

                    {/* Right Column: Code/Diff View */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex-1 bg-[#050505] overflow-y-auto p-4 md:p-8 custom-scrollbar relative"
                        style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                    >
                        <div className="max-w-6xl mx-auto bg-[#0b0c10] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative z-10 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-[#0f1115] border-b border-white/10 gap-4">
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-mono">
                                    <MessagesSquare className="w-4 h-4" />
                                    <span>Pull Request Diff</span>
                                </div>

                                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 w-fit">
                                    <button
                                        onClick={() => setDiffViewMode("inline")}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${diffViewMode === 'inline' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                                    >
                                        <AlignLeft className="w-3.5 h-3.5" /> Inline
                                    </button>
                                    <button
                                        onClick={() => setDiffViewMode("split")}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${diffViewMode === 'split' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                                    >
                                        <Columns className="w-3.5 h-3.5" /> Side-by-Side
                                    </button>
                                </div>
                            </div>

                            <div className="w-full">
                                {aiData?.diff ? (
                                    <DiffViewer diffString={aiData.diff} viewMode={diffViewMode} />
                                ) : (
                                    <div className="text-slate-500 font-mono text-sm p-8 text-center bg-white/[0.01]">No diff available.</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
