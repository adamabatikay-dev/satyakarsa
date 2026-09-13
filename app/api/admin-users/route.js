export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

// GET: Ambil daftar semua admin
export async function GET() {
  try {
    const admins = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true
      }
    });
    return NextResponse.json(admins);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data admin' }, { status: 500 });
  }
}

// POST: Tambah admin baru
export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username dan password harus diisi' }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Username sudah digunakan' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.adminUser.create({
      data: { username, password: hashedPassword }
    });

    return NextResponse.json({ success: true, message: 'Admin berhasil ditambahkan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}

// DELETE: Hapus admin
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    
    // Jangan izinkan hapus jika hanya ada 1 admin
    const count = await prisma.adminUser.count();
    if (count <= 1) {
      return NextResponse.json({ success: false, message: 'Tidak dapat menghapus admin terakhir' }, { status: 400 });
    }

    await prisma.adminUser.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Admin berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menghapus admin' }, { status: 500 });
  }
}
