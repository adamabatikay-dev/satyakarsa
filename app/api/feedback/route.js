import { NextResponse } from 'next/server';
import { getUserFeedbackList, addUserFeedback } from '../../../lib/feedbackLoop';

export async function GET() {
  try {
    const feedbackList = await getUserFeedbackList();
    return NextResponse.json(feedbackList);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, message } = body;
    
    if (!message) return NextResponse.json({ error: 'Pesan wajib diisi' }, { status: 400 });

    const fb = await addUserFeedback({ name, message });
    return NextResponse.json(fb);
  } catch (error) {
    console.error('Feedback POST error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan saran' }, { status: 500 });
  }
}
