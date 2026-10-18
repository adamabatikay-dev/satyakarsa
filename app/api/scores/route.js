import { NextResponse } from 'next/server';
import { saveManualAlternativeScores } from '../../../lib/feedbackLoop';

export async function POST(request) {
  try {
    const body = await request.json();
    const { scores } = body;

    if (!Array.isArray(scores)) {
      return NextResponse.json({ error: 'Format data tidak valid' }, { status: 400 });
    }

    await saveManualAlternativeScores(scores);

    return NextResponse.json({ message: 'Nilai berhasil disimpan' });
  } catch (error) {
    console.error('Scores API Error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan nilai' }, { status: 500 });
  }
}
