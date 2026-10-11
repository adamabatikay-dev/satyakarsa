import { NextResponse } from 'next/server';
import { resetMatrixToBaseline } from '../../../../lib/feedbackLoop';

export async function POST() {
  try {
    const result = await resetMatrixToBaseline();
    return NextResponse.json({
      success: true,
      message: 'Matriks keputusan berhasil dikembalikan ke nilai default/baseline awal',
      ...result
    });
  } catch (error) {
    console.error('Error resetting matrix to baseline:', error);
    return NextResponse.json({ error: 'Gagal mereset matriks keputusan' }, { status: 500 });
  }
}
