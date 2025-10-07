import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI } from '@google/genai';

const handler: Handler = async (event: HandlerEvent) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "GEMINI_API_KEY is not defined in environment variables. Please set it in the Netlify UI." }),
    };
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { type, payload } = body;

    let response;

    switch (type) {
      case 'getRealDiagnosis':
        response = await handleDiagnosis(ai, payload);
        break;
      case 'generateThumbnail':
        response = await handleThumbnail(ai, payload);
        break;
      case 'getKnowledgeAnswer':
        response = await handleKnowledge(ai, payload);
        break;
      default:
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request type' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('Error in Gemini proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};

async function handleDiagnosis(ai: GoogleGenAI, payload: { image: { data: string, mimeType: string }, prompt: string, schema: any }) {
    const imagePart = { inlineData: { data: payload.image.data, mimeType: payload.image.mimeType } };
    const genAIResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: payload.prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: payload.schema,
      },
    });
    return { text: genAIResponse.text };
}

async function handleThumbnail(ai: GoogleGenAI, payload: { prompt: string }) {
    const genAIResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: payload.prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '16:9',
        },
    });
    return { generatedImages: genAIResponse.generatedImages };
}

async function handleKnowledge(ai: GoogleGenAI, payload: { prompt: string, schema: any }) {
    const genAIResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: payload.prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: payload.schema,
        },
    });
    return { text: genAIResponse.text };
}

export { handler };
