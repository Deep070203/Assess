"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GitPullRequest, Search, Clock, Rocket, Filter } from "lucide-react";

export function DashboardClient({ initialPrs, token, user }: { initialPrs: any[], token: string, user: any }) {
    const [activeTab, setActiveTab] = useState<"global" | "repo">("global");

    // Config states loaded from localStorage
    const [selectedRepo, setSelectedRepo] = useState<string>("");
    const [allowedRepos, setAllowedRepos] = useState<string[]>([]);

    // Tab 2 Fetching states
    const [repoPrs, setRepoPrs] = useState<any[]>([]);
    const [isLoadingRepoPrs, setIsLoadingRepoPrs] = useState(false);

    useEffect(() => {
        const stringified = localStorage.getItem("assess_config_repos");
        if (stringified) {
            try {
                const parsed = JSON.parse(stringified);
                setAllowedRepos(parsed);
                if (parsed.length > 0) setSelectedRepo(parsed[0]);
            } catch (e) { }
        }
    }, []);

    useEffect(() => {
        if (activeTab === "repo" && selectedRepo) {
            const fetchRepoPrs = async () => {
                setIsLoadingRepoPrs(true);
                setRepoPrs([]);
                try {
                    const res = await fetch(`https://api.github.com/repos/${selectedRepo}/pulls?state=all&sort=updated`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/vnd.github.v3+json"
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setRepoPrs(data || []);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsLoadingRepoPrs(false);
                }
            };
            fetchRepoPrs();
        }
    }, [activeTab, selectedRepo, token]);

    const getRepoParams = (repoUrl: string) => {
        const match = repoUrl.match(/repos\/([^\/]+)\/([^\/]+)/);
        if (match) return { owner: match[1], repo: match[2] };
        return { owner: "unknown", repo: "unknown" };
    }

    const renderPrGrid = (prsToRender: any[], forceRepoStr?: string) => {
        if (prsToRender.length === 0) {
            return (
                <div className="text-center py-16 text-slate-500 border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium text-slate-400">No pull requests found.</p>
                </div>
            )
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prsToRender.map((pr: any) => {
                    let owner, repo;
                    if (forceRepoStr) {
                        const parts = forceRepoStr.split("/");
                        owner = parts[0]; repo = parts[1];
                    } else if (pr.repository_url) {
                        const params = getRepoParams(pr.repository_url);
                        owner = params.owner; repo = params.repo;
                    } else if (pr.base?.repo?.full_name) {
                        const parts = pr.base.repo.full_name.split("/");
                        owner = parts[0]; repo = parts[1];
                    }

                    const isOpen = pr.state === "open";

                    return (
                        <Link key={pr.id} href={`/${owner}/${repo}/pull/${pr.number}`}
                            className="flex flex-col justify-between p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all group h-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-300 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-colors">
                                        <GitPullRequest className="w-5 h-5" />
                                    </div>
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.4)] ${isOpen ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-purple-500 shadow-purple-500/50'}`}></div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-200 group-hover:text-blue-300 transition-colors text-lg leading-tight line-clamp-2">{pr.title}</h3>
                                    <div className="flex flex-col gap-1.5 mt-3 text-sm text-slate-500 font-mono">
                                        <span className="text-blue-400/80 font-medium px-2 py-1 bg-blue-500/10 rounded-md w-fit">
                                            {owner}/{repo}
                                        </span>
                                        <span className="opacity-70 pl-1 mt-1">PR #{pr.number}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-5 pt-5 border-t border-white/5">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(pr.updated_at || pr.created_at).toLocaleDateString()}
                                </div>
                                <span className="flex items-center gap-1.5 text-blue-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                                    Assess <Rocket className="w-4 h-4" />
                                </span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        )
    };

    return (
        <main className="min-h-screen bg-[#0b0c10] text-[#f8fafc] p-6 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">My Pull Requests</h1>
                        <p className="text-slate-400">Select a Pull Request to run an automated AI Code Review.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="h-10 w-10 relative rounded-full overflow-hidden border-2 border-slate-700 shadow-lg group hover:border-blue-500 transition-colors">
                            <img src={user?.image || ""} alt={user?.name || "User"} className="object-cover w-full h-full opacity-90 group-hover:opacity-100" />
                        </Link>
                    </div>
                </header>

                {/* TABS Navigation */}
                <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setActiveTab("global")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "global" ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        My Global PRs
                    </button>
                    <button
                        onClick={() => setActiveTab("repo")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "repo" ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Repository PRs
                    </button>
                </div>

                {/* TABS Content */}
                {activeTab === "global" ? (
                    <div className="bg-[#101216] border border-white/10 rounded-2xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                            <h2 className="text-lg font-medium flex items-center gap-2">
                                <GitPullRequest className="w-5 h-5 text-blue-400" />
                                Active Contributions (All Repos)
                            </h2>
                        </div>
                        {renderPrGrid(initialPrs)}
                    </div>
                ) : (
                    <div className="bg-[#101216] border border-white/10 rounded-2xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                            <h2 className="text-lg font-medium flex items-center gap-2">
                                <Filter className="w-5 h-5 text-indigo-400" />
                                Filter by Allowed Repository
                            </h2>
                            {allowedRepos.length > 0 && (
                                <select
                                    className="bg-[#0f1115] border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                                    value={selectedRepo}
                                    onChange={(e) => setSelectedRepo(e.target.value)}
                                >
                                    {allowedRepos.map(repo => (
                                        <option key={repo} value={repo}>{repo}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {allowedRepos.length === 0 ? (
                            <div className="text-center py-16 text-slate-500 border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
                                <p className="font-medium text-slate-400 mb-2">No repositories configured.</p>
                                <Link href="/profile" className="text-blue-400 hover:underline text-sm">Update your Profile Configuration</Link>
                            </div>
                        ) : isLoadingRepoPrs ? (
                            <div className="flex justify-center py-16">
                                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            renderPrGrid(repoPrs, selectedRepo)
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
