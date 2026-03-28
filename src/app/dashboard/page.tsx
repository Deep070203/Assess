import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GitPullRequest, Search, CheckCircle2, Clock, Rocket } from "lucide-react";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).accessToken) {
        redirect("/");
    }

    const token = (session as any).accessToken;

    let prs = [];
    try {
        const prsRes = await fetch("https://api.github.com/search/issues?q=is:pr+author:@me&sort=updated", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json"
            },
            next: { revalidate: 60 } // Cache for 1 min
        });

        if (prsRes.ok) {
            const prsData = await prsRes.json();
            prs = prsData.items || [];
        }
    } catch (err) {
        console.error("Failed to fetch PRs:", err);
    }

    // Parses api.github url into owner and repo
    // E.g. https://api.github.com/repos/owner/repo -> { owner, repo }
    const getRepoParams = (repoUrl: string) => {
        const match = repoUrl.match(/repos\/([^\/]+)\/([^\/]+)/);
        if (match) return { owner: match[1], repo: match[2] };
        return { owner: "unknown", repo: "unknown" };
    }

    return (
        <main className="min-h-screen bg-[#0b0c10] text-[#f8fafc] p-6 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">My Pull Requests</h1>
                        <p className="text-slate-400">Select a Pull Request to run an automated AI Code Review.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/settings" className="px-4 py-2 border border-white/10 bg-[#15161b] hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
                            ⚙️ Settings
                        </Link>
                        <div className="h-10 w-10 relative rounded-full overflow-hidden border-2 border-slate-700 shadow-lg">
                            <img src={session.user?.image || ""} alt={session.user?.name || "User"} className="object-cover w-full h-full" />
                        </div>
                    </div>
                </header>

                {/* PR List */}
                <div className="bg-[#101216] border border-white/10 rounded-2xl shadow-2xl p-6">
                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                        <h2 className="text-lg font-medium flex items-center gap-2">
                            <GitPullRequest className="w-5 h-5 text-blue-400" />
                            Active Contributions
                        </h2>
                    </div>

                    {prs.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-medium text-slate-400">No pull requests found.</p>
                            <p className="text-sm mt-1">Make sure you have authorized access to your repositories.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {prs.map((pr: any) => {
                                const { owner, repo } = getRepoParams(pr.repository_url);
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
                                                {new Date(pr.updated_at).toLocaleDateString()}
                                            </div>
                                            <span className="flex items-center gap-1.5 text-blue-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                                                Assess <Rocket className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
