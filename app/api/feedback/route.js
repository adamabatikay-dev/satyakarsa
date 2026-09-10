import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  const feedbackList = await prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(feedbackList);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, message } = body;
    
    if (!message) return NextResponse.json({ error: 'Pesan wajib diisi' }, { status: 400 });

    const fb = await prisma.feedback.create({
      data: { name: name || 'Anonim', message }
    });
    
    return NextResponse.json(fb);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan saran' }, { status: 500 });
  }
}
