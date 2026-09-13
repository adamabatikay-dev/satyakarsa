import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
  try {
    const { currentPassword, newUsername, newPassword } = await request.json();

    // Ambil admin pertama (kita asumsikan hanya ada 1 admin untuk platform ini)
    const admin = await prisma.adminUser.findFirst();

    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin tidak ditemukan' }, { status: 404 });
    }

    // Verifikasi password saat ini
    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Password saat ini salah' }, { status: 401 });
    }

    // Hash password baru jika ada
    const dataToUpdate = {};
    if (newUsername) dataToUpdate.username = newUsername;
    if (newPassword) dataToUpdate.password = await bcrypt.hash(newPassword, 10);

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: dataToUpdate
    });

    return NextResponse.json({ success: true, message: 'Akun berhasil diperbarui' });
  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
