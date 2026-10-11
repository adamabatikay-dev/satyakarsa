import { NextResponse } from 'next/server';
import { getMatrixComparison, getRespondentEvaluations } from '../../../lib/feedbackLoop';

export async function GET() {
  try {
    const data = await getMatrixComparison();
    const evaluations = await getRespondentEvaluations();
    return NextResponse.json({
      ...data,
      evaluations
    });
  } catch (error) {
    console.error('Error fetching feedback loop data:', error);
    return NextResponse.json({ error: 'Gagal memuat data dynamic feedback loop' }, { status: 500 });
  }
}
