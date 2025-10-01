import { NextResponse } from 'next/server';
import { generateQuiz, GenerateQuizInput } from '@/ai/flows/generate-dynamic-quizzes';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validate minimal shape
    if (!body || typeof body.topic !== 'string') {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 });
    }

    const input: GenerateQuizInput = {
      topic: String(body.topic),
      numberOfQuestions: Number(body.numberOfQuestions) || 10,
      difficulty: (body.difficulty === 'facile' || body.difficulty === 'moyen' || body.difficulty === 'difficile') ? body.difficulty : 'moyen',
    };

    const result = await generateQuiz(input);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error in /api/generate-quiz:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
