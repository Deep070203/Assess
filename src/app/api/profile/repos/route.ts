import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { repos } = await req.json();

        const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Delete old selections
        await prisma.configuredRepo.deleteMany({
            where: { userId: dbUser.id }
        });

        // Insert new selections
        if (repos && repos.length > 0) {
            await prisma.configuredRepo.createMany({
                data: repos.map((fullName: string) => ({
                    userId: dbUser.id,
                    fullName
                }))
            });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("DB Error:", e);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ repos: [] });
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { configuredRepos: true }
    });

    if (!dbUser) return NextResponse.json({ repos: [] });

    return NextResponse.json({ repos: dbUser.configuredRepos.map((r: any) => r.fullName) });
}
