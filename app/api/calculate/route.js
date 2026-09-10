import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { calculateSAW } from '../../../lib/saw';

export async function POST(request) {
  try {
    const { userWeights } = await request.json();

    // 1. Fetch criteria and alternatives with their scores
    const criteriaList = await prisma.criteria.findMany();
    const alternatives = await prisma.alternative.findMany({
      include: {
        scores: true
      }
    });

    if (!criteriaList.length || !alternatives.length) {
      return NextResponse.json(
        { error: 'Data Kriteria atau Alternatif belum tersedia di database.' },
        { status: 400 }
      );
    }

    // 2. Perform Calculation
    const results = calculateSAW(alternatives, criteriaList, userWeights);

    // 3. Return results
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Calculation Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat menghitung.' }, { status: 500 });
  }
}
