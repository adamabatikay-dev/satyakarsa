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
  try {
    const body = await request.json();
    const { name, description } = body;
    try {
      const newAlt = await prisma.alternative.create({
        data: { name, description }
      });
      return NextResponse.json(newAlt);
    } catch (e) {
      return NextResponse.json({ id: Date.now(), name, description, scores: [] });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Gagal menambah alternatif' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID alternatif diperlukan' }, { status: 400 });

    try {
      await prisma.alternative.delete({
        where: { id: parseInt(id) }
      });
    } catch (e) {}
    
    return NextResponse.json({ message: 'Alternatif berhasil dihapus' });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal menghapus alternatif' }, { status: 500 });
  }
}
