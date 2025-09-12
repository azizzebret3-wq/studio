'use server';
/**
 * @fileOverview A dynamic quiz generation AI agent.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuestionSchema = z.object({
    question: z.string().describe('The question text.'),
    options: z.array(z.string()).describe('A list of possible answers.'),
    correctAnswers: z.array(z.string()).describe('A list of correct answers. Each string in this array must be an exact match to one of the strings in the `options` array.'),
    explanation: z.string().optional().describe('An optional explanation for the correct answer.'),
});

const QuizSchema = z.object({
    title: z.string().describe('A creative and engaging title for the quiz.'),
    description: z.string().describe('A brief description of the quiz.'),
    category: z.string().describe('The general category of the quiz (e.g., "Culture Générale", "Droit Administratif").'),
    difficulty: z.enum(['facile', 'moyen', 'difficile']).describe('The difficulty level of the quiz.'),
    duration_minutes: z.number().describe('The estimated duration of the quiz in minutes.'),
    questions: z.array(QuestionSchema).describe('A list of 10 to 15 questions for the quiz.'),
});

const GenerateQuizOutputSchema = z.object({
  quiz: QuizSchema,
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert in creating educational quizzes for civil service exams in Burkina Faso. Your task is to generate a complete quiz based on the provided topic.

The quiz must be in French.

Topic: {{{topic}}}

Please generate a complete quiz with the following structure:
- A creative title.
- A short description.
- A relevant category.
- A difficulty level (facile, moyen, or difficile).
- An estimated duration in minutes.
- A list of 10 to 15 questions.
- For each question:
    - The question text.
    - At least 4 plausible options.
    - A list of one or more correct answers. CRITICAL: Each string in the 'correctAnswers' array must be an exact, case-sensitive match to one of the strings in the 'options' array.
    - A brief explanation for the answer, especially if the question is complex.

Ensure the questions are relevant to Burkinabè civil service exams and cover different aspects of the topic. The options should be well-formulated, with credible distractors.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
