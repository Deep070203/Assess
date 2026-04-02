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

    async function fetchReview(forceReRun = false) {
        try {
            setIsLoading(true);
            const res = await fetch("/api/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ owner, repo, pullNumber: number, forceReRun })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to fetch review");

            setAiData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchReview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [owner, repo, number]);

    return (
        <main className="min-h-screen bg-emerald-50/30 text-emerald-950 flex flex-col font-sans">
            {/* Top Navbar */}
            <nav className="w-full border-b border-emerald-200 bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-700/80 hover:text-orange-600 font-bold">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-sm font-mono text-emerald-700/80 font-bold">
                            <span>{owner}</span> / <span className="text-orange-600 font-extrabold">{repo}</span>
                        </div>
                        <h1 className="text-lg font-extrabold flex items-center gap-2 mt-0.5 text-emerald-950">
                            PR #{number} <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 ml-2 shadow-sm">Review Complete</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-3">
                    <a href={`https://github.com/${owner}/${repo}/pull/${number}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100/50 text-emerald-900 border border-emerald-200 shadow-sm text-sm font-bold rounded-lg transition-colors hidden sm:flex items-center">
                        View on GitHub
                    </a>
                    <button onClick={() => fetchReview(true)} disabled={isLoading} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-500/20 text-sm font-bold rounded-lg transition-all w-36 whitespace-nowrap">
                        {isLoading ? "Analyzing..." : "Re-run Review"}
                    </button>
                </div>
            </nav>

            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative w-16 h-16 mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                    </div>
                    <h2 className="text-xl font-extrabold mb-2 text-emerald-900">Analyzing Pull Request</h2>
                    <p className="text-emerald-700/70 animate-pulse text-sm font-bold">Building repository graph context and generating feedback...</p>
                </div>
            ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-xl font-bold mb-2 text-red-900">Review Failed</h2>
                    <p className="text-red-700 max-w-md font-medium">{error}</p>
                    <Link href="/" className="mt-8 px-6 py-2 bg-white border border-emerald-200 hover:border-orange-300 text-emerald-900 font-bold shadow-sm text-sm rounded-lg transition-colors">
                        Go Back
                    </Link>
                </div>
            ) : (
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                    {/* Left Column: AI Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full md:w-[400px] lg:w-[450px] border-r border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white overflow-y-auto p-6"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                            <h2 className="text-2xl font-extrabold tracking-tight text-emerald-950">AI Assessment</h2>
                        </div>

                        <div className="bg-white p-5 rounded-2xl mb-6 shadow-xl shadow-orange-900/5 border border-emerald-100">
                            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">Executive Summary</h3>
                            <p className="text-sm font-medium text-emerald-900 leading-relaxed mb-4">
                                {aiData?.summary || "No summary provided by the agent."}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs font-bold">
                                <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Parsed Context
                                </span>
                                <span className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1.5 shadow-sm">
                                    <AlertCircle className="w-4 h-4 text-orange-500" /> {(aiData?.feedback || []).length} Findings
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4 px-1">Actionable Feedback</h3>

                            {/* Comment Cards */}
                            {(aiData?.feedback || []).map((item: any, i: number) => (
                                <div key={i} className="bg-white hover:bg-emerald-50/30 transition-colors border border-emerald-100 hover:border-orange-300 shadow-lg shadow-emerald-900/5 rounded-2xl p-5 group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 break-all w-3/4">
                                            <FileCode2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {item.file}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm ${item.severity === 'High Signal' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                                            {item.severity || "Issue"}
                                        </span>
                                    </div>
                                    <p className="text-sm mb-4 text-emerald-950 font-medium leading-relaxed">
                                        {item.comment}
                                    </p>
                                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 font-mono text-xs font-bold text-emerald-900 mb-4 overflow-x-auto whitespace-pre custom-scrollbar">
                                        {item.originalCode && <div className="text-orange-700/90 mb-2 border-b border-orange-100/50 pb-2">- {item.originalCode}</div>}
                                        {item.suggestedCode && <div className="text-emerald-700 pt-1">+ {item.suggestedCode}</div>}
                                    </div>

                                    {/* Learning System Feedback */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-emerald-50">
                                        <span className="text-xs font-bold text-emerald-700/70">Tune this rule:</span>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 bg-white hover:bg-emerald-100 rounded-lg border border-emerald-100 shadow-sm text-emerald-700 hover:text-emerald-900 transition-all flex items-center gap-1.5 text-xs font-bold">
                                                <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                                            </button>
                                            <button className="px-3 py-1.5 bg-white hover:bg-orange-100 rounded-lg border border-emerald-100 shadow-sm text-emerald-700 hover:text-orange-700 transition-all flex items-center gap-1.5 text-xs font-bold">
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
                        className="flex-1 bg-gradient-to-br from-emerald-50/50 to-orange-50/20 overflow-y-auto p-4 md:p-8 custom-scrollbar relative"
                        style={{ backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                    >
                        <div className="max-w-6xl mx-auto bg-white border border-emerald-200 rounded-2xl overflow-hidden shadow-2xl relative z-10 w-full mb-12">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-white border-b border-emerald-100 gap-4 shadow-sm z-20 relative">
                                <div className="flex items-center gap-2 text-emerald-900 text-sm font-bold">
                                    <MessagesSquare className="w-5 h-5 text-orange-500" />
                                    <span>Pull Request Diff Viewer</span>
                                </div>

                                <div className="flex items-center gap-1 bg-emerald-50 p-1 rounded-xl border border-emerald-100 w-fit">
                                    <button
                                        onClick={() => setDiffViewMode("inline")}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${diffViewMode === 'inline' ? 'bg-white text-emerald-900 shadow-md border border-emerald-100' : 'text-emerald-600 hover:text-emerald-900 hover:bg-white/50 border border-transparent'}`}
                                    >
                                        <AlignLeft className="w-4 h-4" /> Inline
                                    </button>
                                    <button
                                        onClick={() => setDiffViewMode("split")}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${diffViewMode === 'split' ? 'bg-white text-emerald-900 shadow-md border border-emerald-100' : 'text-emerald-600 hover:text-emerald-900 hover:bg-white/50 border border-transparent'}`}
                                    >
                                        <Columns className="w-4 h-4" /> Side-by-Side
                                    </button>
                                </div>
                            </div>

                            <div className="w-full bg-[#f8fafc] p-6 lg:p-8">
                                {aiData?.diff ? (
                                    <DiffViewer diffString={aiData.diff} viewMode={diffViewMode} />
                                ) : (
                                    <div className="text-emerald-600 font-bold text-sm p-12 text-center bg-emerald-50/50 border border-emerald-100 border-dashed rounded-xl">No diff available.</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
