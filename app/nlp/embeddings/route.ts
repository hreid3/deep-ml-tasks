import { NextRequest } from 'next/server';
import { FeatureExtractionPipelineSingleton } from '@/lib/nlp/feature-extraction';

export const runtime = 'nodejs';

interface RequestBody {
    text: string | string[];
}

/**
 * @swagger
 * /nlp/embeddings:
 *   post:
 *     summary: Generate text embeddings
 *     description: Generate embeddings for a single text or an array of texts using Hugging Face models
 *     tags:
 *       - NLP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 oneOf:
 *                   - type: string
 *                     description: Single text to generate embeddings for
 *                   - type: array
 *                     items:
 *                       type: string
 *                     description: Array of texts to generate embeddings for
 *             required:
 *               - text
 *     responses:
 *       200:
 *         description: Successfully generated embeddings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 embeddings:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items:
 *                       type: number
 *                       description: Vector component
 *       400:
 *         description: Bad request - text parameter is missing or invalid
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as RequestBody;
        if (!body.text) {
            return new Response('Text is required', { status: 400 });
        }

        const featureExtractor = new FeatureExtractionPipelineSingleton();
        const embeddings = [];
        const texts = Array.isArray(body.text) ? body.text : [body.text];

        for (const text of texts) {
            const embedding = await featureExtractor.generateEmbedding(text);
            embeddings.push(embedding);
        }

        return new Response(JSON.stringify({ embeddings }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 
