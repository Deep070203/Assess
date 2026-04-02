import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const recent = await prisma.assessmentCache.findMany({
            orderBy: { createdAt: 'desc' },
            take: 6
        });

        const mapped = recent.map(r => {
            const k = r.cacheKey;
            const suffix = k.replace("assess_review_", "");
            const parts = suffix.split("_");
            const pr = parts.pop();
            const owner = parts.shift();
            const repo = parts.join("_");

            // Format relative time (e.g., "5h ago")
            const diffInMs = new Date().getTime() - new Date(r.createdAt).getTime();
            const hours = Math.floor(diffInMs / (1000 * 60 * 60));
            const days = Math.floor(hours / 24);
            const mins = Math.floor(diffInMs / (1000 * 60));

            let timeStr = `${mins}m ago`;
            if (days > 0) timeStr = `${days}d ago`;
            else if (hours > 0) timeStr = `${hours}h ago`;

            return {
                repo: `${owner}/${repo}`,
                pr: `#${pr}`,
                title: r.summary ? r.summary.substring(0, 60) + "..." : "Completed AI Assessment",
                status: "completed",
                time: timeStr
            }
        });

        return NextResponse.json(mapped);
    } catch (e) {
        console.error(e);
        return NextResponse.json([]);
    }
}
