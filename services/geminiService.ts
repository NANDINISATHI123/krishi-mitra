

import { Report } from '../types';
// FIX: Use the correct `GoogleGenAI` class as per guidelines.
import { GoogleGenAI, Type } from '@google/genai';

// Simulate a network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const API_KEY = process.env.API_KEY;

// Helper function to convert a File object to a GoogleGenerativeAI.Part object.
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// This type is for the raw result from Gemini, before it's saved to the DB
type DiagnosisResult = Omit<Report, 'id' | 'user_id' | 'user_email' | 'created_at' | 'photo_url'> & { photo: string, is_identifiable: boolean, is_plant: boolean };

// --- Real AI Diagnosis using Gemini API ---
export const getRealDiagnosis = async (imageFile: File): Promise<DiagnosisResult> => {
    if (!API_KEY) {
        throw new Error("Gemini API key not found.");
    }
    // FIX: Use the correct `GoogleGenAI` class as per guidelines.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `You are an expert agricultural scientist. Your task is to analyze the attached image and respond ONLY in the structured JSON format defined by the schema.

Step 1: Plant Identification. First, determine if the image contains a plant, crop, or leaf. Set the 'is_plant' field to true or false accordingly.

Step 2: Disease Diagnosis.
- IF 'is_plant' is FALSE: You MUST set 'is_identifiable' to false. Set 'disease' to 'Not a Plant', 'confidence' to 0, 'ai_explanation' to "The uploaded image does not appear to contain a plant. Please upload a photo of a crop for diagnosis.", and 'treatment' to 'N/A'.
- IF 'is_plant' is TRUE: Proceed to identify any plant disease.
    - If a disease is clearly identifiable with high confidence: Set 'is_identifiable' to true, and provide the 'disease' name, 'confidence' score (typically > 60), organic 'treatment' plan, and 'ai_explanation'.
    - If the image is of a plant but the quality is suboptimal (e.g., blurry, poor lighting, bad angle): You should STILL ATTEMPT a diagnosis but assign a lower 'confidence' score (e.g., below 60). In the 'ai_explanation', you MUST state why the confidence is low (e.g., "Confidence is low because the image is slightly out of focus, making a precise diagnosis difficult."). Set 'is_identifiable' to true.
    - Only if the image is of a plant but is completely unrecognizable or provides no diagnostic information: Set 'is_identifiable' to false, 'disease' to 'Unidentifiable', 'confidence' to 0, and 'ai_explanation' to "The image of the plant is too unclear to analyze. For best results, please provide a clear, close-up photo of the affected leaf in good natural light.".

Do not add any text or explanation outside of the JSON structure.`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            is_plant: { type: Type.BOOLEAN, description: "Set to true if the image contains a plant or crop, otherwise false." },
            is_identifiable: { type: Type.BOOLEAN, description: "Set to false ONLY if the plant image is completely unrecognizable." },
            disease: { type: Type.STRING, description: "The name of the disease, or 'Unidentifiable' if is_identifiable is false." },
            confidence: { type: Type.NUMBER, description: "A confidence score from 0 to 100. Set to 0 if not identifiable." },
            treatment: { type: Type.STRING, description: "A detailed organic treatment plan. Provide guidance for the user if not identifiable." },
            ai_explanation: { type: Type.STRING, description: "An explanation of the diagnosis. If confidence is low, explain why (e.g., blurry image)." },
            similar_cases: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        disease: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ["disease", "description"],
                }
            }
        },
        required: ['is_plant', 'is_identifiable', 'disease', 'confidence', 'treatment', 'ai_explanation', 'similar_cases']
    };

    try {
        const response = await ai.models.generateContent({
          // FIX: Use the correct model name as per guidelines.
          model: 'gemini-2.5-flash',
          contents: { parts: [imagePart, { text: prompt }] },
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        });

        const resultJson = JSON.parse(response.text);

        const reader = new FileReader();
        const photoDataUrl = await new Promise<string>(resolve => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imageFile);
        });

        // Map the AI response to our DiagnosisResult type
        return {
            photo: photoDataUrl, // Temporary data URL for display
            is_plant: resultJson.is_plant,
            is_identifiable: resultJson.is_identifiable,
            disease: resultJson.disease,
            confidence: Math.round(resultJson.confidence),
            treatment: resultJson.treatment,
            ai_explanation: resultJson.ai_explanation,
            similar_cases: resultJson.similar_cases?.map((c: any, i: number) => ({
                id: `case_${i}`,
                photo: `https://picsum.photos/seed/case${i+1}/100/100`, // Placeholder image
                disease: c.disease,
            })) || [],
        };

    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error('Failed to communicate with the AI service.');
    }
};


// --- AI Thumbnail Generation ---
export const generateThumbnail = async (title: string, description: string): Promise<string> => {
    if (!API_KEY) {
        console.warn("Gemini API key not found, skipping thumbnail generation.");
        return '';
    }
    // FIX: Use the correct `GoogleGenAI` class as per guidelines.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = `A vibrant, high-quality, photorealistic thumbnail for a farmer's educational video. The video is titled "${title}" and covers "${description}". The image should be visually appealing, relevant to organic farming, and must not contain any text. The aspect ratio must be 16:9.`;
    
    try {
        const response = await ai.models.generateImages({
            // FIX: Use the correct image generation model as per guidelines.
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        return '';
    } catch (error) {
        console.error("Gemini thumbnail generation failed:", error);
        return '';
    }
};


// --- Mock Diagnosis Function (Fallback) ---
export const getMockDiagnosis = async (imageFile: File): Promise<DiagnosisResult> => {
  await delay(1500);
  console.log('Diagnosing image:', imageFile.name);

  const reader = new FileReader();
  const photoDataUrl = await new Promise<string>(resolve => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(imageFile);
  });

  return {
    photo: photoDataUrl,
    is_plant: true,
    is_identifiable: true,
    disease: 'Tomato Leaf Blight (Mock)',
    confidence: 87,
    treatment: '1. Remove and destroy infected leaves immediately.\n2. Apply a copper-based organic fungicide or a neem oil solution every 7-10 days.\n3. Ensure good air circulation around plants by pruning lower branches.\n4. Water at the base of the plant to avoid wetting the leaves.',
    ai_explanation: 'The dark spots with yellow halos on the leaves are characteristic of leaf blight. Our AI model identified these patterns with high confidence based on a dataset of thousands of tomato plant images. The recommended organic treatments work by creating a protective barrier on the leaf surface and inhibiting fungal growth.',
    similar_cases: [
      { id: 'case_1', photo: 'https://picsum.photos/seed/case1/100/100', disease: 'Early Blight' },
      { id: 'case_2', photo: 'https://picsum.photos/seed/case2/100/100', disease: 'Septoria Leaf Spot' },
      { id: 'case_3', photo: 'https://picsum.photos/seed/case3/100/100', disease: 'Bacterial Spot' },
    ],
  };
};

export const getMockKnowledgeAnswer = async (query: string) => {
    await delay(1000);
    console.log('Answering query:', query);
    
    return {
        question: query,
        answer: "Jeevamrutham is a microbial culture that enriches the soil. To prepare it, mix 10 kg of cow dung and 10 litres of cow urine in 200 litres of water. Add 2 kg of jaggery, 2 kg of pulse flour, and a handful of soil from your farm. Stir well and let it ferment for 48 hours. It's then ready to be applied to the soil.",
        likes: 12,
        dislikes: 1,
        related: [
            "How to prepare Panchagavya?",
            "What are the benefits of organic fertilizers?",
            "Best composting methods for small farms",
        ]
    };
};

export const getMockCalendarTasks = async () => {
    await delay(500);
    const { mockCalendarTasks } = await import('../lib/data');
    return mockCalendarTasks;
}