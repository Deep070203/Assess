import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";
import prisma from "@/lib/db";

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

    let dbSavedRepos: string[] = [];
    if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { configuredRepos: true }
        });
        if (dbUser) {
            dbSavedRepos = dbUser.configuredRepos.map((r: any) => r.fullName);
        }
    }

    return <DashboardClient initialPrs={prs} token={token} user={session.user} dbSavedRepos={dbSavedRepos} />;
}
