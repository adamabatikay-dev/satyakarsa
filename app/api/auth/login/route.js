import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const admin = await prisma.adminUser.findUnique({
      where: { username }
    });

    if (!admin) {
      return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'Login berhasil' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
