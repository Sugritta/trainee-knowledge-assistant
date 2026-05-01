import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function POST(req: Request) {
    try {
        const { userQuery } = await req.json();

        // 2. แปลงข้อความให้เป็น Vector ด้วย Gemini
        const result = await embeddingModel.embedContent(userQuery);
        const embeddingVector = result.embedding.values; // นี่คือ Array ของตัวเลข

        // 3. ส่ง Vector ไปค้นหาใน Pinecone
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
        const index = pc.index("punpun-knowledge");

        const queryResponse = await index.query({
            topK: 5,
            vector: embeddingVector, // ใช้ vector ที่ได้จาก Gemini
            includeMetadata: true
        });

        return Response.json({ results: queryResponse.matches });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Embedding or Query failed" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, textToStore, category } = await req.json();

        // 2. แปลงข้อความให้เป็น Vector ด้วย Gemini
        const result = await embeddingModel.embedContent(textToStore);

        // 3. บันทึก Vector ลง Pinecone
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
        const index = pc.index("punpun-knowledge");

        await index.upsert({
            records: [{
                id: id,
                values: result.embedding.values, // เก็บ Vector ลงในช่อง values
                metadata: {
                    chunk_text: textToStore,
                    category: category || "general"
                }
            }]
        });

        return Response.json({ message: "เพิ่มข้อมูลสำเร็จ!" });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Embedding or Upsert failed" }, { status: 500 });
    }
}