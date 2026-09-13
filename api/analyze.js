import { GoogleGenAI } from '@google/genai';

// 明示的にVercelの環境変数からAPIキーを読み込ませる
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { image, mode } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        let prompt = "視覚障害のある方に向けて、このカメラ映像に映っている状況やメインのものを、日本語で一言（1文程度）で簡潔に教えてください。余計な挨拶は不要です。";
        if (mode === 'detail') {
            prompt = "視覚障害のある方に向けて、このカメラ映像に映っているものや周囲の様子、看板などのテキストがあればその内容も含めて、詳しく丁寧に日本語で解説してください。";
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: imageBuffer.toString("base64"),
                        mimeType: "image/jpeg",
                    },
                },
            ],
        });

        const description = response.text;
        return res.status(200).json({ description });

    } catch (error) {
        console.error("API Errorの詳細:", error);
        return res.status(500).json({ error: error.message || 'Failed to analyze image' });
    }
}