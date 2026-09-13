import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { password } = await request.json();

    // Untuk modal verifikasi, kita ambil admin pertama
    const admin = await prisma.adminUser.findFirst();

    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin tidak ditemukan' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Password salah' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'Verifikasi berhasil' });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
