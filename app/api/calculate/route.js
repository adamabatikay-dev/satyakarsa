import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { calculateSAW } from '../../../lib/saw';
import { getActiveMatrixForCalculation, BASELINE_CRITERIA } from '../../../lib/feedbackLoop';

export async function POST(request) {
  try {
    const { userWeights } = await request.json();

    // 1. Fetch criteria and alternatives with their scores
    let criteriaList = [];
    let alternatives = [];

    try {
      criteriaList = await prisma.criteria.findMany({ orderBy: { id: 'asc' } });
      alternatives = await prisma.alternative.findMany({
        include: { scores: true }
      });
    } catch (e) {
      // Prisma offline, fallback to feedback loop active store
    }

    if (!criteriaList.length || !alternatives.length || !alternatives[0]?.scores?.length) {
      criteriaList = BASELINE_CRITERIA;
      alternatives = await getActiveMatrixForCalculation();
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

