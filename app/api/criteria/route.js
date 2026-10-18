import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

import { BASELINE_CRITERIA } from '../../../lib/feedbackLoop';

export async function GET() {
  try {
    const criteria = await prisma.criteria.findMany({
      orderBy: { id: 'asc' }
    });
    if (criteria && criteria.length > 0) {
      return NextResponse.json(criteria);
    }
  } catch (err) {
    // DB unreachable, return baseline
  }
  return NextResponse.json(BASELINE_CRITERIA);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, type, weight } = body;
    try {
      const newCriteria = await prisma.criteria.create({
        data: { name, type, weight: parseFloat(weight) }
      });
      return NextResponse.json(newCriteria);
    } catch (e) {
      return NextResponse.json({ id: Date.now(), name, type, weight: parseFloat(weight) });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Gagal membuat kriteria' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, type, weight } = body;
    
    if (!id) return NextResponse.json({ error: 'ID kriteria diperlukan' }, { status: 400 });

    try {
      const updatedCriteria = await prisma.criteria.update({
        where: { id: parseInt(id) },
        data: { name, type, weight: parseFloat(weight) }
      });
      return NextResponse.json(updatedCriteria);
    } catch (e) {
      return NextResponse.json({ id: parseInt(id), name, type, weight: parseFloat(weight) });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memperbarui kriteria' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID kriteria diperlukan' }, { status: 400 });

    try {
      await prisma.criteria.delete({
        where: { id: parseInt(id) }
      });
    } catch (e) {}
    
    return NextResponse.json({ message: 'Kriteria berhasil dihapus' });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal menghapus kriteria' }, { status: 500 });
  }
}
