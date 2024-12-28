import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import ZeroShotClassificationPipelineSingleton from '@/lib/nlp/zero-shot-classification'

/**
 * @swagger
 * /nlp/zero-shot-classification:
 *   post:
 *     summary: Classify texts into given categories using zero-shot learning
 *     description: |
 *       Takes an array of texts and categories, and classifies each text into the most likely categories.
 *       Returns top N categories (default 3) with confidence scores.
 *     tags:
 *       - NLP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - texts
 *               - categories
 *             properties:
 *               texts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of texts to classify
 *                 example: ["This movie was great!", "The food was terrible"]
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Categories to classify texts into
 *                 example: ["positive", "negative", "neutral"]
 *               topN:
 *                 type: number
 *                 description: Number of top categories to return
 *                 default: 3
 *     responses:
 *       200:
 *         description: Successfully classified texts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                     score:
 *                       type: number
 *       400:
 *         description: Missing or invalid input parameters
 */
export async function POST(request: NextRequest) {
  const { texts, categories, topN = 3 } = await request.json();

  if (!texts || !Array.isArray(texts) || !texts.length) {
    return NextResponse.json({
      error: 'Missing or invalid texts array',
    }, { status: 400 });
  }

  if (!categories || !Array.isArray(categories) || !categories.length) {
    return NextResponse.json({
      error: 'Missing or invalid categories array',
    }, { status: 400 });
  }

  const results = await Promise.all(
    texts.map(text => ZeroShotClassificationPipelineSingleton.classify(text, categories, topN))
  );

  return NextResponse.json(results);
} 