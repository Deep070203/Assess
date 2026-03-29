import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileClient } from "./ProfileClient";
import prisma from "@/lib/db";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).accessToken) {
        redirect("/");
    }

    const token = (session as any).accessToken;

    let repos = [];
    try {
        const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json"
            },
            next: { revalidate: 60 } // Cache for 1 minute
        });

        if (res.ok) {
            repos = await res.json();
        }
    } catch (err) {
        console.error("Failed to fetch repos", err);
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

    return <ProfileClient user={session.user} repositories={repos} dbSavedRepos={dbSavedRepos} />;
}
