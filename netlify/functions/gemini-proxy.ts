
import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI } from '@google/genai';

// This is the main handler Netlify will call for each request.
const handler: Handler = async (event: HandlerEvent) => {
  // CRITICAL FIX: The API key and AI client must be initialized *inside* the handler.
  // This ensures they are set up for each invocation, which is the correct pattern
  // for serverless functions and prevents deployment/runtime errors.
  if (!process.env.API_KEY) {
    console.error("CRITICAL: API_KEY environment variable is not set.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server configuration error: API key is missing." }),
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { type, payload } = body;

    let response;

    // Route the request to the appropriate function based on the 'type' field.
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
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request type specified' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('Error in Gemini proxy function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};

// --- Helper Functions for different AI tasks ---

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

// Ensure the handler is exported correctly for Netlify.
export { handler };