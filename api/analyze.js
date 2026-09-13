import { GoogleGenAI } from '@google/genai';

// 新しいGoogle GenAI SDKの初期化（環境変数からキーを自動読み込み）
const ai = new GoogleGenAI();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { image, mode } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'Image is required' });
        }

        // Base64のヘッダー部分（data:image/jpeg;base64,など）を削除してバッファに変換
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // モードに応じたプロンプトの切り替え
        let prompt = "視覚障害のある方に向けて、このカメラ映像に映っている状況やメインのものを、日本語で一言（1文程度）で簡潔に教えてください。余計な挨拶は不要です。";
        if (mode === 'detail') {
            prompt = "視覚障害のある方に向けて、このカメラ映像に映っているものや周囲の様子、看板などのテキストがあればその内容も含めて、詳しく丁寧に日本語で解説してください。";
        }

        // Gemini API（マルチモーダル）の呼び出し
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // または用途に合わせたモデル
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
        console.error("API Error:", error);
        return res.status(500).json({ error: 'Failed to analyze image' });
    }
}