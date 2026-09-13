import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown';

    const admin = await prisma.adminUser.findUnique({
      where: { username }
    });

    if (!admin) {
      // Log failed attempt
      await prisma.adminAccessLog.create({
        data: { username, status: 'FAILED', ipAddress, userAgent }
      });
      return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      // Log failed attempt with adminId
      await prisma.adminAccessLog.create({
        data: { adminId: admin.id, username, status: 'FAILED', ipAddress, userAgent }
      });
      return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });
    }

    // Log success
    await prisma.adminAccessLog.create({
      data: { adminId: admin.id, username, status: 'SUCCESS', ipAddress, userAgent }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Login berhasil',
      adminId: admin.id,
      username: admin.username
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
