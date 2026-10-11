import { NextResponse } from 'next/server';
import { addRespondentEvaluation } from '../../../../lib/feedbackLoop';

export async function POST(request) {
  try {
    const body = await request.json();
    const { respondentName, alternativeId, scores, comment } = body;

    if (!alternativeId || !scores || Object.keys(scores).length === 0) {
      return NextResponse.json({ error: 'Alternatif dan skor kriteria harus diisi' }, { status: 400 });
    }

    const result = await addRespondentEvaluation({
      respondentName,
      alternativeId: parseInt(alternativeId),
      scores,
      comment
    });

    return NextResponse.json({
      success: true,
      message: 'Penilaian responden berhasil dicatat dan diproses dalam dynamic feedback loop',
      ...result
    });
  } catch (error) {
    console.error('Error submitting respondent evaluation:', error);
    return NextResponse.json({ error: 'Gagal mengirim penilaian responden' }, { status: 500 });
  }
}
