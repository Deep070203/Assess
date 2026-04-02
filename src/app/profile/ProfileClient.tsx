"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Filter, Search, CheckSquare, Square, ShieldCheck, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileClient({ user, repositories, dbSavedRepos }: { user: any, repositories: any[], dbSavedRepos: string[] }) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const allRepoNames = repositories.map(r => r.full_name);
    const [selectedRepos, setSelectedRepos] = useState<string[]>(dbSavedRepos || []);

    useEffect(() => {
        if (dbSavedRepos) {
            setSelectedRepos(dbSavedRepos);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dbSavedRepos]);

    const handleSave = () => {
        setIsSaving(true);
        fetch('/api/profile/repos', {
            method: 'POST',
            body: JSON.stringify({ repos: selectedRepos }),
            headers: { 'Content-Type': 'application/json' }
        }).then(() => {
            router.push("/dashboard");
        }).catch(err => {
            console.error(err);
            setIsSaving(false);
        });
    }

    const toggleRepo = (fullName: string) => {
        if (selectedRepos.includes(fullName)) {
            setSelectedRepos(prev => prev.filter(r => r !== fullName));
        } else {
            setSelectedRepos(prev => [...prev, fullName]);
        }
    }

    const selectAll = () => setSelectedRepos(allRepoNames);
    const deselectAll = () => setSelectedRepos([]);

    const filteredRepos = repositories.filter(r => r.full_name.toLowerCase().includes(search.toLowerCase()));

    return (
        <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 text-emerald-950 flex flex-col p-6 md:p-10 font-sans">
            <div className="max-w-4xl mx-auto w-full">
                {/* Header */}
                <nav className="mb-8 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-emerald-700 hover:text-orange-600 font-bold transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                    </Link>
                </nav>

                <div className="bg-white border border-emerald-100 rounded-2xl shadow-xl shadow-orange-900/5 p-8 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 border-b border-emerald-50 pb-8 mb-8">
                        <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-emerald-50 shadow-xl flex-shrink-0">
                            <img src={user?.image || ""} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-emerald-900">{user?.name || "User Profile"}</h1>
                            <div className="flex items-center gap-2 text-emerald-700 font-mono text-sm font-bold">
                                <UserIcon className="w-4 h-4" />
                                <span>{user?.email || "GitHub Account connected"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-900">
                                <ShieldCheck className="w-5 h-5 text-orange-500" />
                                Repository Access
                            </h2>
                            <p className="text-sm text-emerald-600 mt-1 font-medium">Select which repositories Assess.ai should sync to your Dashboard.</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xl shadow-emerald-600/20"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {isSaving ? "Saving..." : "Save Configuration"}
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search repositories..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white border border-emerald-200 rounded-lg py-2 pl-9 pr-4 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 text-sm font-semibold text-emerald-900 transition-colors"
                            />
                        </div>
                        <div className="flex items-center gap-3 border-l border-emerald-200 pl-4">
                            <button onClick={selectAll} className="text-sm text-emerald-700 hover:text-orange-600 font-bold transition-colors">Select All</button>
                            <span className="text-emerald-300">•</span>
                            <button onClick={deselectAll} className="text-sm text-emerald-700 hover:text-orange-600 font-bold transition-colors">Deselect All</button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="border border-emerald-100 rounded-xl overflow-hidden bg-white shadow-inner">
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {filteredRepos.length === 0 ? (
                                <div className="p-8 text-center text-emerald-600 text-sm font-bold">No repositories match your search.</div>
                            ) : (
                                filteredRepos.map(repo => {
                                    const isSelected = selectedRepos.includes(repo.full_name);
                                    return (
                                        <div
                                            key={repo.id}
                                            onClick={() => toggleRepo(repo.full_name)}
                                            className={`flex items-center gap-4 p-4 border-b border-emerald-50 last:border-0 cursor-pointer transition-colors hover:bg-emerald-50/50 ${isSelected ? 'bg-orange-50/30' : ''}`}
                                        >
                                            <div className={`flex justify-center items-center w-5 h-5 rounded border ${isSelected ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20' : 'border-emerald-200 text-transparent'}`}>
                                                <CheckSquare className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-mono text-sm font-bold ${isSelected ? 'text-orange-700' : 'text-emerald-700'}`}>{repo.full_name}</span>
                                                {repo.private && <span className="text-[10px] uppercase font-black text-emerald-500 tracking-wider mt-0.5">Private</span>}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-xs font-bold text-emerald-600 text-right">
                    {selectedRepos.length} of {repositories.length} repositories selected
                </div>
            </div>
        </main>
    );
}
