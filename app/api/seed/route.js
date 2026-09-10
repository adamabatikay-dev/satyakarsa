import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST() {
  try {
    // Check if data already exists
    const count = await prisma.criteria.count();
    if (count > 0) {
      return NextResponse.json({ message: 'Data already seeded' });
    }

    // 1. Create Criteria
    const c1 = await prisma.criteria.create({ data: { name: 'Biaya Iklan (Cost)', type: 'cost', weight: 4 } });
    const c2 = await prisma.criteria.create({ data: { name: 'Jangkauan Audiens (Reach)', type: 'benefit', weight: 5 } });
    const c3 = await prisma.criteria.create({ data: { name: 'Tingkat Interaksi (Engagement)', type: 'benefit', weight: 4 } });
    const c4 = await prisma.criteria.create({ data: { name: 'Kemudahan Penggunaan', type: 'benefit', weight: 3 } });

    // 2. Create Alternatives
    const a1 = await prisma.alternative.create({ data: { name: 'Instagram Ads', description: 'Platform visual dengan engagement tinggi, cocok untuk produk lifestyle.' } });
    const a2 = await prisma.alternative.create({ data: { name: 'TikTok Ads', description: 'Video pendek dengan potensi viral tinggi untuk Gen Z.' } });
    const a3 = await prisma.alternative.create({ data: { name: 'Google Search Ads', description: 'Menargetkan orang yang secara aktif mencari produk Anda.' } });
    const a4 = await prisma.alternative.create({ data: { name: 'Facebook Ads', description: 'Jangkauan audiens terluas dengan penargetan demografi detail.' } });

    // 3. Create Scores (Scale 1-100 or 1-5, let's use 1-100 for variety)
    const scoresData = [
      // Instagram
      { alternativeId: a1.id, criteriaId: c1.id, value: 70 }, // Biaya lumayan mahal
      { alternativeId: a1.id, criteriaId: c2.id, value: 85 }, // Jangkauan luas
      { alternativeId: a1.id, criteriaId: c3.id, value: 90 }, // Engagement sangat tinggi
      { alternativeId: a1.id, criteriaId: c4.id, value: 80 }, // Cukup mudah

      // TikTok
      { alternativeId: a2.id, criteriaId: c1.id, value: 60 }, // Biaya lebih murah dari IG
      { alternativeId: a2.id, criteriaId: c2.id, value: 95 }, // Jangkauan sangat luas (viral)
      { alternativeId: a2.id, criteriaId: c3.id, value: 95 }, // Engagement tertinggi
      { alternativeId: a2.id, criteriaId: c4.id, value: 70 }, // Agak susah buat video

      // Google
      { alternativeId: a3.id, criteriaId: c1.id, value: 90 }, // Biaya paling mahal
      { alternativeId: a3.id, criteriaId: c2.id, value: 80 }, // Jangkauan terarah
      { alternativeId: a3.id, criteriaId: c3.id, value: 75 }, // Engagement medium
      { alternativeId: a3.id, criteriaId: c4.id, value: 60 }, // Paling susah disetup

      // Facebook
      { alternativeId: a4.id, criteriaId: c1.id, value: 65 }, // Biaya menengah
      { alternativeId: a4.id, criteriaId: c2.id, value: 90 }, // Jangkauan sangat luas
      { alternativeId: a4.id, criteriaId: c3.id, value: 70 }, // Engagement menurun
      { alternativeId: a4.id, criteriaId: c4.id, value: 75 }, // Kemudahan sedang
    ];

    for (const score of scoresData) {
      await prisma.alternativeScore.create({ data: score });
    }

    return NextResponse.json({ message: 'Seed successful' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
