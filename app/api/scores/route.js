import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { scores } = body;

    if (!Array.isArray(scores)) {
      return NextResponse.json({ error: 'Format data tidak valid' }, { status: 400 });
    }

    // Using transaction to upsert multiple scores
    const operations = scores.map(score => {
      return prisma.alternativeScore.upsert({
        where: {
          alternativeId_criteriaId: {
            alternativeId: score.alternativeId,
            criteriaId: score.criteriaId
          }
        },
        update: {
          value: score.value
        },
        create: {
          alternativeId: score.alternativeId,
          criteriaId: score.criteriaId,
          value: score.value
        }
      });
    });

    await prisma.$transaction(operations);

    return NextResponse.json({ message: 'Nilai berhasil disimpan' });
  } catch (error) {
    console.error('Scores API Error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan nilai' }, { status: 500 });
  }
}
