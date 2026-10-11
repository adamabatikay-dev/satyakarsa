import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown';

    let admin = null;
    let isDbAvailable = true;

    try {
      admin = await prisma.adminUser.findUnique({
        where: { username }
      });
    } catch (dbErr) {
      console.warn('Prisma DB unavailable for login, checking fallback admin:', dbErr.message);
      isDbAvailable = false;
    }

    if (isDbAvailable) {
      if (!admin) {
        // Log failed attempt if DB is accessible
        try {
          await prisma.adminAccessLog.create({
            data: { username, status: 'FAILED', ipAddress, userAgent }
          });
        } catch (e) {}
        return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });
      }

      const isValid = await bcrypt.compare(password, admin.password);

      if (!isValid) {
        try {
          await prisma.adminAccessLog.create({
            data: { adminId: admin.id, username, status: 'FAILED', ipAddress, userAgent }
          });
        } catch (e) {}
        return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });
      }

      // Log success
      try {
        await prisma.adminAccessLog.create({
          data: { adminId: admin.id, username, status: 'SUCCESS', ipAddress, userAgent }
        });
      } catch (e) {}

      return NextResponse.json({ 
        success: true, 
        message: 'Login berhasil',
        adminId: admin.id,
        username: admin.username
      });
    }

    // Fallback authentication when database is unreachable / paused
    if (username === 'admin' && (password === 'admin123' || password === 'admin')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Login berhasil (Akses Administrator)',
        adminId: 1,
        username: 'admin'
      });
    }

    return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan sistem saat proses masuk' }, { status: 500 });
  }
}

