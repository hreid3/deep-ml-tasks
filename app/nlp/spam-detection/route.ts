import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import SpamDetectionPipelineSingleton from '@/lib/nlp/spam-detection'

/**
 * @swagger
 * /nlp/spam-detection:
 *   post:
 *     summary: Detect spam in text
 *     description: |
 *       Takes a single text string or array of strings and detects if they are spam.
 *       Returns spam classification and probability score.
 *     tags:
 *       - NLP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *                 description: Text or array of texts to check for spam
 *                 example: "Click here to win a free iPhone!"
 *     responses:
 *       200:
 *         description: Successfully classified text(s)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     spam:
 *                       type: boolean
 *                     probability:
 *                       type: number
 *                 - type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       spam:
 *                         type: boolean
 *                       probability:
 *                         type: number
 *       400:
 *         description: Missing or invalid input parameters
 */
export async function POST(request: NextRequest) {
  const { text } = await request.json();

  if (!text || (typeof text !== 'string' && !Array.isArray(text))) {
    return NextResponse.json({
      error: 'Missing or invalid text parameter',
    }, { status: 400 });
  }

  try {
    const texts = Array.isArray(text) ? text : [text];
    const results = await SpamDetectionPipelineSingleton.detectBatch(texts);
    return NextResponse.json(Array.isArray(text) ? results : results[0]);
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to process text',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 