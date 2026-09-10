import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  const alternatives = await prisma.alternative.findMany({
    include: { scores: true }
  });
  return NextResponse.json(alternatives);
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
