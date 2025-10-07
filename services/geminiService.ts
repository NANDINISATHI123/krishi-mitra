import { Report } from '../types.ts';
import { GoogleGenAI, Type } from '@google/genai';

// Helper to convert File to a base64 string for JSON transport
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

type DiagnosisResult = Omit<Report, 'id' | 'user_id' | 'user_email' | 'created_at' | 'photo_url'> & { photo: string, is_identifiable: boolean, is_plant: boolean };

// --- Real AI Diagnosis using Secure Proxy ---
export const getRealDiagnosis = async (imageFile: File): Promise<DiagnosisResult> => {
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
            is_plant: { type: Type.BOOLEAN },
            is_identifiable: { type: Type.BOOLEAN },
            disease: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            treatment: { type: Type.STRING },
            ai_explanation: { type: Type.STRING },
            similar_cases: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { disease: { type: Type.STRING }, description: { type: Type.STRING } },
                }
            }
        },
    };
    
    try {
        const base64Data = await fileToBase64(imageFile);
        const proxyResponse = await fetch('/.netlify/functions/gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'getRealDiagnosis',
                payload: {
                    image: { data: base64Data, mimeType: imageFile.type },
                    prompt,
                    schema
                }
            })
        });

        if (!proxyResponse.ok) {
            const errorBody = await proxyResponse.json();
            throw new Error(errorBody.error || `Proxy request failed with status ${proxyResponse.status}`);
        }
        
        const result = await proxyResponse.json();
        const resultJson = JSON.parse(result.text);

        const photoDataUrl = URL.createObjectURL(imageFile);

        return {
            photo: photoDataUrl,
            is_plant: resultJson.is_plant,
            is_identifiable: resultJson.is_identifiable,
            disease: resultJson.disease,
            confidence: Math.round(resultJson.confidence),
            treatment: resultJson.treatment,
            ai_explanation: resultJson.ai_explanation,
            similar_cases: resultJson.similar_cases?.map((c: any, i: number) => ({
                id: `case_${i}`,
                photo: `https://picsum.photos/seed/case${i+1}/100/100`,
                disease: c.disease,
            })) || [],
        };
    } catch (error) {
        console.error("Secure AI call failed:", error);
        throw new Error('Failed to communicate with the AI service.');
    }
};

// --- AI Thumbnail Generation using Secure Proxy ---
export const generateThumbnail = async (title: string, description: string): Promise<string> => {
    const prompt = `A vibrant, high-quality, photorealistic thumbnail for a farmer's educational video. The video is titled "${title}" and covers "${description}". The image should be visually appealing, relevant to organic farming, and must not contain any text. The aspect ratio must be 16:9.`;
    
    try {
        const proxyResponse = await fetch('/.netlify/functions/gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'generateThumbnail',
                payload: { prompt }
            })
        });

        if (!proxyResponse.ok) {
            const errorBody = await proxyResponse.json();
            throw new Error(errorBody.error || 'Proxy request failed');
        }

        const response = await proxyResponse.json();

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