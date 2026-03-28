"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, Save, Shield, Code2, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const [strictness, setStrictness] = useState(5);
    const [rules, setRules] = useState("1. Enforce strict TypeScript typing.\n2. Prefer functional components.\n3. No console.log statements.");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <main className="min-h-screen bg-[#0b0c10] text-[#f8fafc] flex flex-col items-center">
            <div className="hero-gradient" />

            {/* Navbar */}
            <nav className="w-full flex justify-between items-center p-6 lg:px-12 max-w-7xl mx-auto z-10 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Settings className="text-blue-500 w-5 h-5" />
                        <span className="text-lg font-semibold tracking-tight">Configuration</span>
                    </div>
                </div>
            </nav>

            <div className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    {/* General Settings */}
                    <section className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="flex items-center gap-3 mb-6">
                            <SlidersHorizontal className="text-blue-400 w-5 h-5" />
                            <h2 className="text-lg md:text-xl font-semibold">Review Strictness</h2>
                        </div>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Adjust the nitpickiness of the AI Review Agent. Higher strictness will surface minor stylistic issues, while lower strictness focuses exclusively on critical bugs and architectural flaws.
                        </p>
                        <div className="flex items-center gap-4 md:gap-6">
                            <span className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wider">Lenient</span>
                            <input
                                type="range"
                                min="1" max="10"
                                value={strictness}
                                onChange={(e) => setStrictness(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <span className="text-[10px] md:text-xs font-medium text-blue-400 uppercase tracking-wider">Strict</span>
                        </div>
                        <div className="mt-4 text-center text-xs md:text-sm font-mono text-blue-400 bg-blue-500/10 py-1.5 px-4 rounded-lg inline-block border border-blue-500/20">
                            Level {strictness}
                        </div>
                    </section>

                    {/* Custom Context/Rules */}
                    <section className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                        <div className="flex items-center gap-3 mb-6">
                            <Code2 className="text-purple-400 w-5 h-5" />
                            <h2 className="text-lg md:text-xl font-semibold">Custom Standards</h2>
                        </div>
                        <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                            Define repository-specific or team guidelines. The agent will read these rules before reviewing code to enforce architectural constraints.
                        </p>
                        <textarea
                            value={rules}
                            onChange={(e) => setRules(e.target.value)}
                            className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-5 text-sm font-mono text-slate-300 focus:outline-none focus:border-purple-500/50 transition-colors custom-scrollbar"
                        />
                    </section>

                    {/* Security / Agent Status */}
                    <section className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="text-emerald-400 w-5 h-5" />
                            <h2 className="text-lg md:text-xl font-semibold">Security & API</h2>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/5 rounded-xl border border-white/5 gap-4">
                            <div>
                                <h3 className="font-medium text-slate-200">Gemini API Key</h3>
                                <p className="text-xs text-slate-500 mt-1">Configured securely via backend environment variables.</p>
                            </div>
                            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg flex items-center gap-2 w-fit">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Active
                            </div>
                        </div>
                    </section>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 pb-12">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {isSaving ? "Saving Configuration..." : "Save Configuration"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
