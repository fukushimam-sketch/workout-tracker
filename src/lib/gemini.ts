import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function generateWorkoutAdvice(userMessage: string, workoutHistory: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
あなたは筋トレのコーチです。ユーザーの筋トレについての質問や相談に答えてください。

ユーザーの最近のワークアウト履歴:
${workoutHistory}

ユーザーの質問: ${userMessage}

ユーザーの質問に対して、的確で励ましのあるアドバイスを日本語で提供してください。
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}
