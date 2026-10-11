import { NextResponse } from 'next/server';
import { syncDecisionMatrix } from '../../../../lib/feedbackLoop';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { customAlpha, notes } = body;

    const result = await syncDecisionMatrix({
      syncType: 'manual',
      notes: notes || 'Sinkronisasi manual matriks keputusan dipicu oleh Administrator.',
      customAlpha: customAlpha !== undefined ? customAlpha : null
    });

    return NextResponse.json({
      success: true,
      message: 'Matriks keputusan berhasil disinkronkan dengan penilaian responden terbaru',
      ...result
    });
  } catch (error) {
    console.error('Error synchronizing decision matrix:', error);
    return NextResponse.json({ error: 'Gagal menyinkronkan matriks keputusan' }, { status: 500 });
  }
}
