import { NextResponse } from 'next/server';
import { getRecommendationRecords, addRecommendationRecord } from '../../../lib/feedbackLoop';

export async function GET() {
  try {
    const records = await getRecommendationRecords();
    return NextResponse.json(records);
  } catch (err) {
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { identityData, topAlternativeId, topAlternativeName, score } = body;
    
    const record = await addRecommendationRecord({
      identityData,
      topAlternativeId,
      topAlternativeName,
      score
    });
    
    return NextResponse.json(record);
  } catch (error) {
    console.error('Records POST error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan riwayat' }, { status: 500 });
  }
}
