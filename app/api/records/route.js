import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  const records = await prisma.recommendationRecord.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(records);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { identityData, topAlternativeId, topAlternativeName, score } = body;
    
    const record = await prisma.recommendationRecord.create({
      data: {
        identityData: JSON.stringify(identityData),
        topAlternativeId: parseInt(topAlternativeId),
        topAlternativeName,
        score: parseFloat(score)
      }
    });
    
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan riwayat' }, { status: 500 });
  }
}
