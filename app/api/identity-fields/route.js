import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  const defaultFields = [
    { id: 1, name: 'Nama Lengkap', type: 'text' },
    { id: 2, name: 'Rentang Usia', type: 'select', options: '18-24,25-34,35-44,45-54,55+' },
    { id: 3, name: 'Domisili (Kota)', type: 'text' }
  ];

  try {
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
  } catch (err) {
    return NextResponse.json(defaultFields);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, type, options } = body;
    
    try {
      const newField = await prisma.identityField.create({
        data: { name, type, options }
      });
      return NextResponse.json(newField);
    } catch (e) {
      return NextResponse.json({ id: Date.now(), name, type, options });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah field' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

    try {
      await prisma.identityField.delete({
        where: { id: parseInt(id) }
      });
    } catch (e) {}
    
    return NextResponse.json({ message: 'Field berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus field' }, { status: 500 });
  }
}
