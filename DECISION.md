# Architecture Decisions

---

## Decision 1: Chose PostgreSQL over SQLite

### Context

โปรเจกต์ PunPun AI Chatbot ต้องการฐานข้อมูลสำหรับจัดการข้อมูลผู้ใช้ (Login, Signup) และเก็บประวัติการเข้าสู่ระบบ โดยต้องรองรับการ Deploy ผ่าน Docker และการเชื่อมต่อจาก Prisma ORM

### Alternatives Considered

- **SQLite** — ฐานข้อมูลแบบ File-based ที่ไม่ต้องติดตั้ง server แยก ง่ายต่อการ setup ในช่วงเริ่มต้น
- **PostgreSQL** — ฐานข้อมูล Relational แบบ Client-Server รองรับ concurrent connections และ production workload ได้ดี

### Why PostgreSQL

PostgreSQL เหมาะกับโปรเจกต์นี้มากกว่า เนื่องจากระบบมีการจัดการ User Authentication ที่ต้องการความน่าเชื่อถือสูง รองรับการ Deploy ผ่าน Docker Compose ได้อย่างเป็นธรรมชาติ (สามารถ spin up ทั้ง app และ db พร้อมกัน) และ Prisma ORM รองรับ PostgreSQL ได้อย่างสมบูรณ์แบบ นอกจากนี้ยังรองรับการขยายตัวในอนาคตหากต้องการเพิ่มฟีเจอร์เช่น เก็บประวัติการแชท หรือ document metadata

### Trade-offs

- ต้องตั้งค่า `DATABASE_URL` และ connection string ให้ถูกต้อง ซึ่งเป็นแหล่งที่มาของหลาย error ระหว่างพัฒนา (Sessions 20–21) เช่น `api_key was not specified`, เครื่องหมาย quotes ใน `.env` และ conflict ระหว่าง `.env` กับ `.env.local`
- Setup ซับซ้อนกว่า SQLite เล็กน้อย แต่ผลลัพธ์คุ้มค่าสำหรับ production use

---

## Decision 2: Chose Pinecone over In-memory / Local Vector Store

### Context

เมื่อจำนวนเอกสารในระบบเพิ่มขึ้น การส่งเนื้อหาทั้งไฟล์เข้า Gemini ทุกครั้ง (Inline Data) ทำให้สิ้นเปลือง Token มากและไม่ scalable จึงต้องการระบบ RAG (Retrieval-Augmented Generation) เพื่อดึงเฉพาะส่วนที่เกี่ยวข้องมาตอบ

### Alternatives Considered

- **In-memory vector store** — เก็บ embeddings ใน RAM ตอน runtime ไม่ต้องพึ่ง external service แต่ข้อมูลหายทุกครั้งที่ restart server
- **Local vector DB (เช่น Chroma, Qdrant)** — ติดตั้งบนเครื่องได้ แต่ต้องจัดการ infrastructure เพิ่มเติม
- **Pinecone** — Managed vector database บน cloud เชื่อมต่อได้ง่ายผ่าน API key

### Why Pinecone

Pinecone ถูกเลือกเพราะใช้งานง่ายจาก Next.js โดยตรง ไม่ต้องจัดการ server เพิ่มเติม และข้อมูล embeddings ยังคงอยู่แม้ restart app ทีมยังใช้ Google Generative AI อยู่แล้ว จึงเชื่อมต่อ `text-embedding-004` กับ Pinecone ได้อย่างราบรื่น (Session 16) และตัดปัญหาเรื่อง Token overuse จากการส่งไฟล์ทั้งหมดเข้า LLM ทุก request

### Trade-offs

- ต้องพึ่งพา external service (Pinecone) ซึ่งมี latency เพิ่มขึ้นเล็กน้อยและต้องจัดการ API key เพิ่ม
- Embedding model ต้อง match กับ dimension ที่ตั้งค่าใน Pinecone index เช่น ต้องเปลี่ยนจาก default (llama) ไปเป็น Google embedding และปรับ Dense configuration ให้ตรงกัน (My Adjustment, Session 16)

---

## Decision 3: Chose gemini-2.5-flash with thinkingBudget:0 over Switching Model

### Context

ระหว่างพัฒนา พบว่า AI ตอบช้ามากเพราะ `gemini-2.5-flash` เปิด "Thinking Mode" ไว้ by default ทำให้แต่ละ response ใช้เวลานานก่อนตอบ ทีมต้องการแก้ปัญหา latency โดยไม่เปลี่ยน model หลัก

### Alternatives Considered

- **เปลี่ยนเป็น `gemini-2.0-flash`** — รุ่นที่เบากว่าและตอบเร็วกว่า แต่ไม่สามารถเปลี่ยนได้เนื่องจากข้อจำกัดของสิทธิ์การใช้งาน API ในขณะนั้น
- **เพิ่ม `maxOutputTokens: 8192`** — ช่วยให้ตอบได้ยาวขึ้นแต่ไม่ได้แก้ปัญหาความช้า (Session 8)
- **ปิด Thinking Mode ด้วย `thinkingBudget: 0`** — ปิดขั้นตอนการ "คิด" ของ model ก่อนตอบ ทำให้ตอบเร็วขึ้นทันที

### Why thinkingBudget:0

การปิด Thinking Mode ช่วยลด latency ได้ประมาณ 3–5 เท่าโดยไม่ต้องเปลี่ยน model หรือโครงสร้าง API เลย เหมาะกับ Chatbot ที่ต้องการ UX ที่ตอบสนองเร็ว และยังคงใช้ `gemini-2.5-flash` ซึ่งเป็น model ที่ได้รับอนุญาตอยู่แล้ว

### Trade-offs

- การปิด Thinking Mode อาจทำให้คำตอบสำหรับคำถามซับซ้อนมีคุณภาพต่ำกว่าเล็กน้อย เพราะ model ไม่ได้ผ่านกระบวนการ reasoning ก่อนตอบ
- ต้อง cast type เป็น `as any` ใน TypeScript เพราะ `thinkingConfig` ยังไม่มีใน official type definition ของ `@google/generative-ai` ในเวอร์ชันที่ใช้ (Session 9–10) ซึ่งอาจต้องอัปเดตในอนาคตเมื่อ type ถูกเพิ่มอย่างเป็นทางการ