import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 1. Input Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Please fill in all fields' },
        { status: 400 }
      );
    }

    // 2. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // 4. Create new user in database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 5. Return success response (exclude password)
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(
      {
        message: 'Sign up successful',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
