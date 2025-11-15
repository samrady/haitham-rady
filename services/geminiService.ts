import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { StoryAnalysisData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModel = 'gemini-2.5-pro';
const imageModel = 'gemini-2.5-flash-image';
const videoModel = 'veo-3.1-fast-generate-preview';

const parseJsonResponse = <T>(jsonText: string, context: string): T => {
    try {
        const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/```$/, '');
        const result = JSON.parse(cleanedJsonText);
        if (!result) {
            throw new Error("API returned empty object.");
        }
        return result;
    } catch (e) {
        console.error(`Failed to parse Gemini response for ${context}:`, jsonText, e);
        throw new Error(`Could not parse the generated ${context}.`);
    }
};


export const generateStoryFromIdea = async (
  idea: string,
  genre: string,
  style: string,
  length: number
): Promise<string> => {
    const prompt = `
    أنت كاتب سيناريو وروائي خبير. مهمتك هي تحويل فكرة بسيطة إلى قصة قصيرة وجذابة.
    
    الفكرة: "${idea}"
    النوع الأدبي: ${genre}
    أسلوب الكتابة: ${style}
    الطول التقريبي: حوالي ${length} حرف.

    يرجى كتابة قصة متكاملة بناءً على هذه المدخلات، مع التركيز على بناء الشخصيات، الحبكة، والحوار. يجب أن تكون القصة جاهزة للاستخدام في إنتاج مرئي.
    `;
    
    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
    });

    return response.text;
}

export const generateStoryAnalysis = async (scenario: string, sceneCount: number): Promise<StoryAnalysisData> => {
  const prompt = `أنت مساعد متخصص في تحليل النصوص القصصية وتحويلها إلى بيانات منظمة للإنتاج المرئي.
بناءً على السيناريو التالي، قم بتنفيذ مهمتين:
1.  تحويل النص إلى مجموعة مشاهد منظمة (حوالي ${sceneCount} مشاهد).
2.  استخراج قائمة بالشخصيات الرئيسية في القصة مع وصف تفصيلي لكل شخصية.

السيناريو: "${scenario}"

قواعد ضرورية للمشاهد:
- حافظ على تسلسل الأحداث.
- قسّم النص إلى مشاهد منطقية.
- لكل مشهد، قدم عنوانًا، وصفًا تفصيليًا، الشخصيات، المكان، الزمان، العناصر البارزة (props)، الجو العام (mood).
- الأهم: اكتب "prompt" إبداعي ومفصل لإنشاء صورة فنية للمشهد. يجب أن يتضمن البرومبت وصفًا بصريًا للمكان، الشخصيات، زاوية الكاميرا، والإضاءة ليعطي نتيجة سينمائية.
- اكتب "prompt" يصف الانتقال البصري للمشهد التالي (اترك هذا الحقل فارغاً للمشهد الأخير).

قواعد ضرورية للشخصيات:
- استخرج الشخصيات الرئيسية فقط.
- قدم وصفًا موجزًا لكل شخصية.
- استخرج 3-5 سمات شخصية بارزة.
- استخرج 3-5 تفاصيل بصرية مميزة (ملابس، ملامح).
- الأهم: اكتب وصفًا بصريًا دقيقًا ومفصلًا يمكن استخدامه لإنشاء صورة بورتريه للشخصية.

الإخراج النهائي يجب أن يكون كائن JSON واحد بالخصائص التالية: "scenes" و "characters".
`;

  const response = await ai.models.generateContent({
    model: textModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            description: "مجموعة المشاهد المستخرجة من القصة.",
            items: {
              type: Type.OBJECT,
              properties: {
                scene_title: { type: Type.STRING, description: "عنوان المشهد." },
                detailed_description: { type: Type.STRING, description: "وصف تفصيلي للمشهد." },
                characters: { type: Type.ARRAY, items: { type: Type.STRING }, description: "الشخصيات في المشهد." },
                location: { type: Type.STRING, description: "مكان المشهد." },
                time: { type: Type.STRING, description: "زمان المشهد." },
                props: { type: Type.ARRAY, items: { type: Type.STRING }, description: "العناصر البارزة." },
                mood: { type: Type.STRING, description: "الجو العام." },
                creative_prompt_for_image: { type: Type.STRING, description: "برومبت إبداعي لتوليد صورة المشهد." },
                transition_prompt_to_next_scene: { type: Type.STRING, description: "برومبت يصف الانتقال البصري للمشهد التالي." }
              },
              required: ["scene_title", "detailed_description", "characters", "location", "time", "props", "mood", "creative_prompt_for_image"]
            }
          },
          characters: {
            type: Type.ARRAY,
            description: "قائمة بالشخصيات الرئيسية في القصة.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "اسم الشخصية." },
                description: { type: Type.STRING, description: "وصف موجز للشخصية." },
                personality_traits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بسمات الشخصية." },
                visual_details: { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بالتفاصيل البصرية." },
                detailed_visual_description_for_portrait: { type: Type.STRING, description: "وصف بصري دقيق لتوليد صورة الشخصية." }
              },
              required: ["name", "description", "personality_traits", "visual_details", "detailed_visual_description_for_portrait"]
            }
          }
        },
        required: ["scenes", "characters"]
      }
    }
  });
  
  const result = parseJsonResponse<StoryAnalysisData>(response.text, "story analysis");
  if (!result || !Array.isArray(result.scenes) || !Array.isArray(result.characters)) {
      throw new Error("API returned an invalid data structure for story analysis.");
  }
  return result;
};

const getSpecificImageError = (response: any): string => {
    const candidate = response.candidates?.[0];
    if (candidate?.finishReason === 'SAFETY') {
        const safetyRating = candidate.safetyRatings?.find(r => r.probability !== 'NEGLIGIBLE' && r.probability !== 'LOW');
        if (safetyRating) {
            return `تم الحظر بسبب سياسات المحتوى (${safetyRating.category}).`;
        }
        return "تم حظر إنشاء الصورة بسبب سياسات المحتوى. حاول تعديل البرومبت.";
    }
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
        return `توقف التوليد بسبب: ${candidate.finishReason}.`;
    }
    return "لم يتم استلام بيانات الصورة من الواجهة البرمجية.";
};

export const generateStyledSceneImage = async (prompt: string, style: string, aspectRatio: string, characterImages: {name: string, base64: string}[]): Promise<string> => {
  const characterReferenceText = characterImages.length > 0
    ? ` استخدم صور الشخصيات المرفقة كمرجع أساسي لمظهرهم في هذا المشهد: ${characterImages.map(c => c.name).join(', ')}.`
    : '';

  const fullPrompt = `Generate a cinematic concept art image in a "${style}" style with a "${aspectRatio}" aspect ratio. Scene description: ${prompt}.${characterReferenceText}`;

  const imageParts = characterImages.map(img => {
      const [header, data] = img.base64.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
      return {
        inlineData: { mimeType, data }
      };
  });

  const response = await ai.models.generateContent({
    model: imageModel,
    contents: { parts: [{ text: fullPrompt }, ...imageParts] },
    config: {
      responseModalities: [Modality.IMAGE],
    }
  });

  const firstPart = response.candidates?.[0]?.content?.parts?.[0];
  if (firstPart?.inlineData?.data) {
    const base64ImageBytes = firstPart.inlineData.data;
    return `data:${firstPart.inlineData.mimeType};base64,${base64ImageBytes}`;
  }

  throw new Error(getSpecificImageError(response));
};

export const generateCharacterPortrait = async (characterDescription: string, style: string): Promise<string> => {
    const fullPrompt = `Generate a high-quality character portrait concept art in a "${style}" style. The character is described as: "${characterDescription}". The portrait should focus on the character's appearance, personality, and key visual details.`;

    const response = await ai.models.generateContent({
        model: imageModel,
        contents: { parts: [{ text: fullPrompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        }
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart?.inlineData?.data) {
        const base64ImageBytes = firstPart.inlineData.data;
        return `data:${firstPart.inlineData.mimeType};base64,${base64ImageBytes}`;
    }
    
    throw new Error(getSpecificImageError(response));
};

export const generateSceneVideo = async (prompt: string, imageBase64: string, aspectRatio: string): Promise<string> => {
    try {
        const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const [header, data] = imageBase64.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';

        let operation = await videoAi.models.generateVideos({
            model: videoModel,
            prompt: `Animate this scene based on the following description. The video should start with the provided image and bring it to life: ${prompt}`,
            image: { imageBytes: data, mimeType },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio as '16:9' | '9:16' | '1:1' | '4:3' | '3:4',
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await videoAi.operations.getVideosOperation({ operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            const error = (operation as any).error;
            if (error?.message) {
                 throw new Error(`فشل التوليد: ${error.message}`);
            }
            throw new Error("اكتمل التوليد ولكن لم يتم العثور على رابط تنزيل.");
        }
        
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            const errorBodyText = await response.text();
            if (response.status === 429 || errorBodyText.includes('RESOURCE_EXHAUSTED')) {
                throw new Error("تجاوزت الحصة المخصصة لك. يرجى التحقق من خطتك.");
            }
            throw new Error(`فشل تحميل الفيديو: ${response.statusText}`);
        }
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);
    } catch (err) {
        console.error("Video Generation Error:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes("API key not valid") || errorMessage.includes("permission")) {
            throw new Error("مفتاح API غير صالح أو لا يملك الأذونات اللازمة.");
        }
        if (errorMessage.includes("quota")) {
            throw new Error("تجاوزت الحصة المخصصة لك. يرجى التحقق من خطتك.");
        }
        throw err; // Re-throw original or wrapped error
    }
};