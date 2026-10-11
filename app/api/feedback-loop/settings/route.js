import { NextResponse } from 'next/server';
import { updateFeedbackSettings } from '../../../../lib/feedbackLoop';

export async function POST(request) {
  try {
    const body = await request.json();
    const { isAutoUpdate, updateMode, batchThreshold, blendingAlpha } = body;

    const updated = await updateFeedbackSettings({
      isAutoUpdate: typeof isAutoUpdate === 'boolean' ? isAutoUpdate : true,
      updateMode: updateMode || 'periodic',
      batchThreshold: parseInt(batchThreshold) || 5,
      blendingAlpha: parseFloat(blendingAlpha) ?? 0.5
    });

    return NextResponse.json({
      success: true,
      message: 'Pengaturan dynamic feedback loop berhasil disimpan',
      settings: updated
    });
  } catch (error) {
    console.error('Error updating feedback settings:', error);
    return NextResponse.json({ error: 'Gagal memperbarui pengaturan' }, { status: 500 });
  }
}
