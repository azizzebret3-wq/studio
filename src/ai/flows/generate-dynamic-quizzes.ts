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
  numberOfQuestions: z.number().describe('The number of questions to generate for the quiz.'),
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
    questions: z.array(QuestionSchema).describe('A list of questions for the quiz.'),
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
  prompt: `Vous êtes un expert pédagogue spécialisé dans la création de matériel de préparation pour les concours de la fonction publique du Burkina Faso.
Votre mission est de concevoir un quiz exceptionnel, pertinent et stimulant sur le sujet fourni.

Le quiz doit être entièrement en français et optimisé pour un apprentissage efficace.

Sujet du Quiz : {{{topic}}}

Veuillez générer un quiz complet en respectant scrupuleusement la structure suivante :
- Un titre créatif et accrocheur.
- Une description concise mais informative.
- Une catégorie pertinente pour les concours burkinabè (ex: "Culture Générale", "Droit Administratif", "Histoire du Burkina Faso").
- Un niveau de difficulté évalué ('facile', 'moyen', 'difficile').
- Une durée estimée en minutes, réaliste pour le nombre de questions.
- Une liste de {{{numberOfQuestions}}} questions.

Pour chaque question, vous devez fournir :
- Le texte de la question : Clair, sans ambiguïté, et conçu pour tester la compréhension et l'analyse, pas seulement la mémorisation.
- Au moins 4 options de réponse : Les distracteurs (mauvaises réponses) doivent être plausibles, basés sur des erreurs courantes ou des concepts proches.
- La ou les bonnes réponses : CRUCIAL : la chaîne de caractères de chaque bonne réponse doit correspondre EXACTEMENT à l'une des chaînes dans le tableau d'options.
- Une explication détaillée et pédagogique : C'est obligatoire. Expliquez pourquoi la ou les réponses sont correctes et, si possible, pourquoi les autres options sont incorrectes. Cette explication est la clé de la valeur ajoutée de l'apprentissage.

Assurez-vous que les questions couvrent divers aspects du sujet (historiques, culturels, juridiques, administratifs, etc.) et sont formulées de manière à préparer solidement les candidats aux exigences réelles des concours.
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
