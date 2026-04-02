"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GitPullRequest, Search, Clock, Rocket, Filter } from "lucide-react";

export function DashboardClient({ initialPrs, token, user, dbSavedRepos }: { initialPrs: any[], token: string, user: any, dbSavedRepos: string[] }) {
    const [activeTab, setActiveTab] = useState<"global" | "repo">("global");

    // Config states loaded from API/DB
    const [selectedRepo, setSelectedRepo] = useState<string>("");
    const [allowedRepos, setAllowedRepos] = useState<string[]>(dbSavedRepos || []);

    // Tab 2 Fetching states
    const [repoPrs, setRepoPrs] = useState<any[]>([]);
    const [isLoadingRepoPrs, setIsLoadingRepoPrs] = useState(false);

    useEffect(() => {
        if (dbSavedRepos && dbSavedRepos.length > 0) {
            setAllowedRepos(dbSavedRepos);
            if (!selectedRepo) setSelectedRepo(dbSavedRepos[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dbSavedRepos]);

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
                <div className="text-center py-16 text-emerald-700/70 border border-emerald-200 border-dashed rounded-xl bg-white/50">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20 text-emerald-900" />
                    <p className="font-medium text-emerald-800">No pull requests found.</p>
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
                            className="flex flex-col justify-between p-6 rounded-2xl border border-emerald-100 bg-white hover:bg-emerald-50/50 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-900/5 transition-all group h-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-200 transition-colors">
                                        <GitPullRequest className="w-5 h-5" />
                                    </div>
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${isOpen ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-orange-500 shadow-orange-500/50'}`}></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors text-lg leading-tight line-clamp-2">{pr.title}</h3>
                                    <div className="flex flex-col gap-1.5 mt-3 text-sm text-emerald-700/70 font-mono">
                                        <span className="text-orange-700 font-bold px-2 py-1 bg-orange-50 rounded-md w-fit border border-orange-100">
                                            {owner}/{repo}
                                        </span>
                                        <span className="opacity-70 pl-1 mt-1 font-medium">PR #{pr.number}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-5 pt-5 border-t border-emerald-50">
                                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(pr.updated_at || pr.created_at).toLocaleDateString()}
                                </div>
                                <span className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-sm group-hover:translate-x-1 group-hover:text-orange-600 transition-all">
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
        <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 text-emerald-950 p-6 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-emerald-900">My Pull Requests</h1>
                        <p className="text-emerald-700/80 font-medium">Select a Pull Request to run an automated AI Code Review.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="h-10 w-10 relative rounded-full overflow-hidden border-2 border-emerald-200 shadow-lg group hover:border-orange-400 transition-colors">
                            <img src={user?.image || ""} alt={user?.name || "User"} className="object-cover w-full h-full opacity-90 group-hover:opacity-100" />
                        </Link>
                    </div>
                </header>

                {/* TABS Navigation */}
                <div className="flex items-center gap-4 mb-6 border-b border-emerald-100 pb-4">
                    <button
                        onClick={() => setActiveTab("global")}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "global" ? 'bg-emerald-100 text-emerald-800 border-none shadow-sm' : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'}`}
                    >
                        My Global PRs
                    </button>
                    <button
                        onClick={() => setActiveTab("repo")}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "repo" ? 'bg-emerald-100 text-emerald-800 border-none shadow-sm' : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'}`}
                    >
                        Repository PRs
                    </button>
                </div>

                {/* TABS Content */}
                {activeTab === "global" ? (
                    <div className="bg-white border border-emerald-100 rounded-2xl shadow-xl shadow-orange-900/5 p-6">
                        <div className="flex items-center justify-between mb-8 border-b border-emerald-50 pb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-900">
                                <GitPullRequest className="w-5 h-5 text-emerald-500" />
                                Active Contributions (All Repos)
                            </h2>
                        </div>
                        {renderPrGrid(initialPrs)}
                    </div>
                ) : (
                    <div className="bg-white border border-emerald-100 rounded-2xl shadow-xl shadow-orange-900/5 p-6">
                        <div className="flex items-center justify-between mb-8 border-b border-emerald-50 pb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-900">
                                <Filter className="w-5 h-5 text-orange-500" />
                                Filter by Allowed Repository
                            </h2>
                            {allowedRepos.length > 0 && (
                                <select
                                    className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-sm text-emerald-900 font-semibold focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all font-mono"
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
                            <div className="text-center py-16 text-emerald-700/70 border border-emerald-200 border-dashed rounded-xl bg-white/50">
                                <p className="font-semibold text-emerald-800 mb-2">No repositories configured.</p>
                                <Link href="/profile" className="text-orange-600 font-bold hover:underline text-sm">Update your Profile Configuration</Link>
                            </div>
                        ) : isLoadingRepoPrs ? (
                            <div className="flex justify-center py-16">
                                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
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
