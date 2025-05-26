// Implemented Genkit flow for AI-powered analysis of test failures, suggesting potential causes for frequently failing tests.

'use server';

/**
 * @fileOverview Analyzes test failures using AI to suggest potential causes for frequently failing tests.
 *
 * - analyzeTestFailures - A function that handles the analysis of test failures.
 * - AnalyzeTestFailuresInput - The input type for the analyzeTestFailures function.
 * - AnalyzeTestFailuresOutput - The return type for the analyzeTestFailures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTestFailuresInputSchema = z.object({
  testResults: z.string().describe('A string containing the test results data.'),
});
export type AnalyzeTestFailuresInput = z.infer<typeof AnalyzeTestFailuresInputSchema>;

const AnalyzeTestFailuresOutputSchema = z.object({
  suggestedCauses: z.string().describe('A string containing the suggested causes for the frequently failing tests.'),
});
export type AnalyzeTestFailuresOutput = z.infer<typeof AnalyzeTestFailuresOutputSchema>;

export async function analyzeTestFailures(input: AnalyzeTestFailuresInput): Promise<AnalyzeTestFailuresOutput> {
  return analyzeTestFailuresFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTestFailuresPrompt',
  input: {schema: AnalyzeTestFailuresInputSchema},
  output: {schema: AnalyzeTestFailuresOutputSchema},
  prompt: `You are an AI assistant that analyzes test failure data and suggests potential causes for frequently failing tests.

  Analyze the following test results and provide a list of suggested causes for the failures. Be specific and provide actionable insights.

  Test Results:
  {{testResults}}`,
});

const analyzeTestFailuresFlow = ai.defineFlow(
  {
    name: 'analyzeTestFailuresFlow',
    inputSchema: AnalyzeTestFailuresInputSchema,
    outputSchema: AnalyzeTestFailuresOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
