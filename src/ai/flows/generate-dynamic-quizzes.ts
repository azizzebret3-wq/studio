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
        correctAnswer: z.string().describe('The correct answer to the question.'),
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
  prompt: `You are a quiz generator that creates quizzes based on the competition type, topic and number of questions specified by the user.

Generate a quiz for the following competition type: {{{competitionType}}}.
The quiz should be on the following topic: {{{topic}}}.
The quiz should have the following number of questions: {{{numberOfQuestions}}}.

The quiz should have a title and a description.
Each question should have a question, an array of options, and a correct answer.
Make sure that the correct answer is always included in the options.

Ensure that the quiz is tailored to the specified competition type and topic.
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
