import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  let fields = await prisma.identityField.findMany({
    orderBy: { id: 'asc' }
  });

  // Auto-seed defaults if empty
  if (fields.length === 0) {
    await prisma.identityField.createMany({
      data: [
        { name: 'Nama Lengkap', type: 'text' },
        { name: 'Rentang Usia', type: 'select', options: '18-24,25-34,35-44,45-54,55+' },
        { name: 'Domisili (Kota)', type: 'text' }
      ]
    });
    fields = await prisma.identityField.findMany({ orderBy: { id: 'asc' } });
  }

  return NextResponse.json(fields);
}

export async function POST(request) {
  const body = await request.json();
  const { name, type, options } = body;
  
  const newField = await prisma.identityField.create({
    data: { name, type, options }
  });
  
  return NextResponse.json(newField);
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

  await prisma.identityField.delete({
    where: { id: parseInt(id) }
  });
  
  return NextResponse.json({ message: 'Field berhasil dihapus' });
}
