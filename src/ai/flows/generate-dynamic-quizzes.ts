// src/ai/flows/generate-dynamic-quizzes.ts
'use server';

/**
 * @fileOverview Dynamically generates quizzes based on the selected competition type.
 *
 * - generateQuiz - A function that generates a quiz.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  competitionType: z.string().describe('The type of competition the quiz should be tailored for.'),
  topic: z.string().describe('The topic of the quiz.'),
  numberOfQuestions: z.number().describe('The number of questions to generate.'),
  difficulty: z.string().describe('The difficulty of the quiz (e.g., facile, moyen, difficile).'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quiz: z.object({
    title: z.string().describe('The title of the quiz.'),
    description: z.string().describe('A brief description of the quiz.'),
    questions: z.array(
      z.object({
        question: z.string().describe('The text of the question.'),
        options: z.array(z.string()).describe('The possible answer options.'),
        correctAnswers: z.array(z.string()).describe('The list of correct answers to the question. Can be one or more.'),
        explanation: z.string().optional().describe('An optional explanation for the correct answer(s).'),
      })
    ).describe('The questions in the quiz, with options and correct answers.'),
  }).describe('The generated quiz.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are a quiz generator that creates quizzes based on the competition type, topic, number of questions, and difficulty specified by the user.

Generate a quiz for the following competition type: {{{competitionType}}}.
The quiz should be on the following topic: {{{topic}}}.
The quiz should have the following number of questions: {{{numberOfQuestions}}}.
The quiz should have the following difficulty: {{{difficulty}}}.

The quiz should have a title and a description.
Each question should have:
- The question text.
- An array of options.
- An array of one or more correct answers.
- An optional, brief explanation for the correct answer(s).

Make sure that all correct answers are always included in the options array.
Ensure that the quiz is tailored to the specified competition type, topic, and difficulty.
`, 
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await generateQuizPrompt(input);
    return output!;
  }
);
