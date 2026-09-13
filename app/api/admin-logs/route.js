import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.adminAccessLog.findMany({
      orderBy: { accessedAt: 'desc' },
      take: 50 // Limit 50 data terbaru agar tidak berat
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data log' }, { status: 500 });
  }
}
