import { NextRequest, NextResponse } from "next/server";
import { Part, GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

async function fileToGenerativePart(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType: file.type,
    },
  };
}

export async function POST(req: NextRequest) {
  console.log("API Key Status:", process.env.GOOGLE_API_KEY ? "✓ Present" : "✗ Missing");

  try {
    const formData = await req.formData();
    const userMessage = formData.get("userMessage") as string;
    const historyString = formData.get("history") as string;
    const files = formData.getAll("files") as File[];
    const fileNames = files.map((f) => f.name);

    const history = historyString ? JSON.parse(historyString) : [];

    // ระบุชื่อไฟล์ที่แนบมาใน system prompt เพื่อให้ AI อ้างอิงได้ถูกต้อง
    const attachedFilesInfo =
      fileNames.length > 0
        ? `\n\n### 📁 Attached Documents in this session:\n${fileNames.map((n, i) => `- [DOC${i + 1}] ${n}`).join("\n")}`
        : "";

    const systemPrompt = `
You are PunPun, a highly intelligent and professional AI Knowledge Assistant.
Your goal is to provide accurate, deeply analyzed, and beautifully structured responses using Markdown.

### 🧠 Intelligence & Analysis
- **Analyze Deeply:** Before answering, identify the user's intent. Break complex requests into logical steps.
- **Fact-Based:** Prioritize information from attached files. If the info isn't there, state it clearly.
- **Proactive:** Anticipate follow-up needs and provide brief, helpful tips.

### 🎨 Markdown UI Structure (Strict Rules)
- Use standard Markdown to structure your response.
- Use ## for main topics and ### for sub-topics.
- **IMPORTANT:** Always put a SPACE after the # symbols (e.g., "### Header" NOT "###Header").
- Use **bold** for emphasis on key terms.
- Always leave a BLANK LINE before and after every header, list, or bold text to ensure correct rendering.

### 📌 Source Citation Rules (CRITICAL)
- If you use information from attached documents, you MUST cite the source at the end of your response.
- Use this EXACT format for the citation block — do not deviate:

---SOURCES---
[DOC1] filename.pdf: brief description of what was used from this document
[DOC2] filename.txt: brief description of what was used from this document
---END_SOURCES---

- If no documents are attached or you did not use any document content, omit the block entirely.
- Place the citation block at the very end of your response, after all other content.

### 🌐 Language Policy
- Respond in the same language as the user (Thai for Thai, English for English).
- Use a helpful, polite, and professional tone.
${attachedFilesInfo}
`;

    const contentParts: Part[] = [];

    if (files.length > 0) {
      for (const file of files) {
        const part = await fileToGenerativePart(file);
        contentParts.push(part);
      }
    }

    contentParts.push({ text: userMessage });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent({
      contents: [
        ...history,
        { role: "user", parts: contentParts },
      ],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 8192,
      },
    });

    const rawText = result.response.text();

    // แยก citation block ออกจาก response หลัก
    const sourcesMatch = rawText.match(/---SOURCES---([\s\S]*?)---END_SOURCES---/);
    let responseText = rawText;
    let sources: { ref: string; filename: string; description: string }[] = [];

    if (sourcesMatch) {
      // ตัด citation block ออกจากข้อความหลัก
      responseText = rawText.replace(/---SOURCES---[\s\S]*?---END_SOURCES---/, "").trim();

      // parse แต่ละบรรทัดของ citation
      const sourceLines = sourcesMatch[1].trim().split("\n").filter(Boolean);
      sources = sourceLines.map((line) => {
        // รูปแบบ: [DOC1] filename.pdf: description
        const match = line.match(/\[(DOC\d+)\]\s+(.+?):\s+(.+)/);
        if (match) {
          return { ref: match[1], filename: match[2].trim(), description: match[3].trim() };
        }
        return { ref: "", filename: "", description: line.trim() };
      }).filter((s) => s.ref || s.description);
    }

    // ดึง token usage จาก Gemini response
    const usage = result.response.usageMetadata;
    const tokenUsage = usage
      ? {
          promptTokens: usage.promptTokenCount ?? 0,
          candidateTokens: usage.candidatesTokenCount ?? 0,
          totalTokens: usage.totalTokenCount ?? 0,
        }
      : null;

    console.log("✓ AI Response generated successfully");
    if (tokenUsage) {
      console.log(`Token usage — prompt: ${tokenUsage.promptTokens}, output: ${tokenUsage.candidateTokens}, total: ${tokenUsage.totalTokens}`);
    }

    return NextResponse.json({ response: responseText, sources, tokenUsage });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("API Error:", errorMessage);

    if (error && typeof error === "object" && "status" in error && error.status === 429) {
      return NextResponse.json({ error: "Server is busy..." }, { status: 429 });
    }

    return NextResponse.json(
      { error: "An error occurred: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}