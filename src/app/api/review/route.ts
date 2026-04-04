import { NextResponse } from "next/server";
import { runAIReview } from "@/lib/ai-review";

export async function POST(request: Request) {
    try {
        const { owner, repo, pullNumber, forceReRun } = await request.json();

        if (!owner || !repo || !pullNumber) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const reviewData = await runAIReview(owner, repo, pullNumber, forceReRun);

        return NextResponse.json(reviewData);

    } catch (error: any) {
        console.error("Review API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
