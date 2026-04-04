import prisma from "@/lib/db";

export async function runAIReview(owner: string, repo: string, pullNumber: string, forceReRun: boolean = false) {
    const cacheKey = `assess_review_${owner}__${repo}_${pullNumber}`;

    if (!forceReRun) {
        const cached = await prisma.assessmentCache.findUnique({
            where: { cacheKey }
        });
        if (cached) {
            return {
                summary: cached.summary,
                feedback: cached.feedback,
                diff: cached.diff
            };
        }
    }

    // Fetch the raw PR diff from GitHub
    const diffUrl = `https://github.com/${owner}/${repo}/pull/${pullNumber}.diff`;
    const githubRes = await fetch(diffUrl);

    if (!githubRes.ok) {
        throw new Error("Failed to fetch Pull Request diff from GitHub. Check if the repo is public.");
    }

    const diffText = await githubRes.text();
    const apiKey = process.env.GEMINI_API_KEY;

    // Provide a mocked response out of the box for demonstration if no API key is set
    if (!apiKey) {
        await new Promise(resolve => setTimeout(resolve, 2500));
        const mockResponse = {
            summary: "This PR modifies several files. The diff suggests a refactoring to standard conventions. No critical security vulnerabilities were detected, but the changes lack comprehensive error handling for some new logic branches.",
            feedback: [
                {
                    file: "src/utils/index.ts",
                    severity: "High Signal",
                    comment: "Consider wrapping this block in a try-catch. Failures here will bubble up unhandled and potentially crash the component tree.",
                    originalCode: "// unhandled block",
                    suggestedCode: "try {\n  // logic\n} catch (e) {\n  console.error(e);\n}"
                }
            ]
        };

        await prisma.assessmentCache.upsert({
            where: { cacheKey },
            update: {
                summary: mockResponse.summary,
                feedback: mockResponse.feedback,
                diff: diffText
            },
            create: {
                cacheKey,
                summary: mockResponse.summary,
                feedback: mockResponse.feedback,
                diff: diffText
            }
        });

        return { ...mockResponse, diff: diffText };
    }

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: `Review this PR diff:\n\n${diffText.substring(0, 25000)}` }
                    ]
                }
            ],
            systemInstruction: {
                parts: [
                    { text: 'You are an advanced AI Code Reviewer. Analyze the provided git diff and provide an executive summary and actionable feedback items. Format your response strictly as JSON with this structure: {"summary": "string", "feedback": [{ "file": "string", "severity": "High Signal|Nitpick", "comment": "string", "originalCode": "string", "suggestedCode": "string" }]}' }
                ]
            },
            generationConfig: {
                responseMimeType: "application/json"
            }
        })
    });

    const aiData = await geminiRes.json();
    if (!geminiRes.ok) {
        throw new Error("Failed to generate AI Assessment: " + (aiData.error?.message || "Unknown error"));
    }

    let jsonText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    jsonText = jsonText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    let aiReview;
    try {
        aiReview = JSON.parse(jsonText);
    } catch (e) {
        console.error("JSON Parsing Error on:", jsonText);
        aiReview = { summary: "AI failed to format the response natively.", feedback: [] };
    }

    // Save to DB
    await prisma.assessmentCache.upsert({
        where: { cacheKey },
        update: {
            summary: aiReview.summary,
            feedback: aiReview.feedback,
            diff: diffText
        },
        create: {
            cacheKey,
            summary: aiReview.summary,
            feedback: aiReview.feedback,
            diff: diffText
        }
    });

    return {
        ...aiReview,
        diff: diffText
    };
}
