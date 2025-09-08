// Summarize Training Content Flow
'use server';
/**
 * @fileOverview A training content summarization AI agent.
 *
 * - summarizeTrainingContent - A function that handles the summarization process.
 * - SummarizeTrainingContentInput - The input type for the summarizeTrainingContent function.
 * - SummarizeTrainingContentOutput - The return type for the summarizeTrainingContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTrainingContentInputSchema = z.object({
  content: z.string().describe('The training content to be summarized.'),
});
export type SummarizeTrainingContentInput = z.infer<typeof SummarizeTrainingContentInputSchema>;

const SummarizeTrainingContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the training content.'),
});
export type SummarizeTrainingContentOutput = z.infer<typeof SummarizeTrainingContentOutputSchema>;

export async function summarizeTrainingContent(input: SummarizeTrainingContentInput): Promise<SummarizeTrainingContentOutput> {
  return summarizeTrainingContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTrainingContentPrompt',
  input: {schema: SummarizeTrainingContentInputSchema},
  output: {schema: SummarizeTrainingContentOutputSchema},
  prompt: `You are an expert summarizer, able to distill complex information into its key points.\n\nSummarize the following training content:\n\n{{content}}`,
});

const summarizeTrainingContentFlow = ai.defineFlow(
  {
    name: 'summarizeTrainingContentFlow',
    inputSchema: SummarizeTrainingContentInputSchema,
    outputSchema: SummarizeTrainingContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
