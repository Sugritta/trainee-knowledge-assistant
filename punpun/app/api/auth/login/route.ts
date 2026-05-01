import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/prisma'; // อ้างอิงไฟล์ prisma ที่เราสร้างไว้

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. ตรวจสอบ Input Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'กรุณากรอก email และ password' },
        { status: 400 }
      );
    }

    // 2. ค้นหาผู้ใช้จาก Database ด้วย Email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // 3. ถ้าไม่เจอผู้ใช้ในระบบ
    if (!user) {
      return NextResponse.json(
        { message: 'ไม่พบผู้ใช้งานนี้ในระบบ' },
        { status: 404 }
      );
    }

    // 4. ตรวจสอบรหัสผ่านด้วย bcryptjs (ปลอดภัย)
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // 5. ล็อกอินสำเร็จ - เก็บข้อมูลการเข้าสู่ระบบ
    // สร้าง payload สำหรับ session (อาจารจะต้องเพิ่ม JWT token ตรงนี้)
    const loginData = {
      userId: user.id,
      email: user.email,
      loginTime: new Date().toISOString(),
    };

    // 6. ส่งข้อมูลผู้ใช้กลับ (ไม่รวม password เพื่อความปลอดภัย)
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json(
      { 
        message: 'Login successful', 
        user: userWithoutPassword,
        session: loginData
      },
      { status: 200 }
    );

    // 7. (ตัวเลือก) สามารถเพิ่ม Cookie สำหรับ Session ได้ที่นี่
    // response.cookies.set('sessionToken', jwtToken, { 
    //   httpOnly: true, 
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 60 * 60 * 24 // 24 hours
    // });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}