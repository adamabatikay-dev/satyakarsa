import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

import { getActiveMatrixForCalculation } from '../../../lib/feedbackLoop';

export async function GET() {
  try {
    const alternatives = await prisma.alternative.findMany({
      orderBy: { id: 'asc' },
      include: { scores: true }
    });
    if (alternatives && alternatives.length > 0) {
      return NextResponse.json(alternatives);
    }
  } catch (err) {
    // DB unreachable, fallback to active matrix store
  }
  const alts = await getActiveMatrixForCalculation();
  return NextResponse.json(alts);
}

export async function POST(request) {
  const body = await request.json();
  const { name, description } = body;
  const newAlt = await prisma.alternative.create({
    data: { name, description }
  });
  return NextResponse.json(newAlt);
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID alternatif diperlukan' }, { status: 400 });

  await prisma.alternative.delete({
    where: { id: parseInt(id) }
  });
  
  return NextResponse.json({ message: 'Alternatif berhasil dihapus' });
}
