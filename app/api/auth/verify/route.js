import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { password } = await request.json();

    let admin = null;
    let isDbAvailable = true;

    try {
      admin = await prisma.adminUser.findFirst();
    } catch (e) {
      isDbAvailable = false;
    }

    if (isDbAvailable && admin) {
      const isValid = await bcrypt.compare(password, admin.password);
      if (!isValid) {
        return NextResponse.json({ success: false, message: 'Password salah' }, { status: 401 });
      }
      return NextResponse.json({ success: true, message: 'Verifikasi berhasil' });
    }

    // Fallback verification when database is offline / paused
    if (password === 'admin123' || password === 'admin') {
      return NextResponse.json({ success: true, message: 'Verifikasi berhasil' });
    }

    return NextResponse.json({ success: false, message: 'Password salah' }, { status: 401 });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan sistem saat verifikasi' }, { status: 500 });
  }
}
