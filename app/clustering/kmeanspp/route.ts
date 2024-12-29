import { NextRequest, NextResponse } from 'next/server';
import { clusterEmbeddings } from '../../../lib/clustering/kmeanspp';

/**
 * @swagger
 * /clustering/kmeanspp:
 *   post:
 *     summary: Cluster text embeddings using k-means++
 *     description: Groups similar text embeddings together using k-means++ clustering
 *     tags:
 *       - Clustering
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inputs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - text
 *                     - embedding
 *                   properties:
 *                     text:
 *                       type: string
 *                       description: The text associated with the embedding
 *                       example: "Meeting about Q4 sales targets"
 *                     embedding:
 *                       type: array
 *                       items:
 *                         type: number
 *                       description: Vector representation of the text
 *                       example: [0.1, 0.2, 0.3, 0.4]
 *               nClusters:
 *                 type: number
 *                 description: Number of clusters (2-6, defaults to 3)
 *                 minimum: 2
 *                 maximum: 6
 *                 default: 3
 *                 example: 3
 *           example:
 *             inputs:
 *               - text: "sales meeting"
 *                 embedding: [0.9, 0.1, 0.1]
 *               - text: "revenue discussion"
 *                 embedding: [0.85, 0.15, 0.1]
 *               - text: "lunch break"
 *                 embedding: [0.1, 0.9, 0.1]
 *               - text: "team lunch"
 *                 embedding: [0.15, 0.85, 0.1]
 *             nClusters: 2
 *     responses:
 *       200:
 *         description: Successfully clustered embeddings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     embedding:
 *                       type: array
 *                       items:
 *                         type: number
 *             example:
 *               cluster_0:
 *                 - text: "sales meeting"
 *                   embedding: [0.9, 0.1, 0.1]
 *                 - text: "revenue discussion"
 *                   embedding: [0.85, 0.15, 0.1]
 *               cluster_1:
 *                 - text: "lunch break"
 *                   embedding: [0.1, 0.9, 0.1]
 *                 - text: "team lunch"
 *                   embedding: [0.15, 0.85, 0.1]
 *       400:
 *         description: Invalid input format or parameters
 *         content:
 *           application/json:
 *             example:
 *               error: "Input must be an array of objects with text and embedding fields"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal server error"
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!Array.isArray(body.inputs)) {
      return NextResponse.json(
        { error: 'Input must be an array of objects with text and embedding fields' },
        { status: 400 }
      );
    }

    // Validate input format
    const isValidInput = body.inputs.every(
      (item: any) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.text === 'string' &&
        Array.isArray(item.embedding) &&
        item.embedding.every((num: any) => typeof num === 'number')
    );

    if (!isValidInput) {
      return NextResponse.json(
        { error: 'Invalid input format. Each item must have text and embedding fields' },
        { status: 400 }
      );
    }

    const nClusters = Math.min(6, Math.max(2, body.nClusters || 3));
    const clusters = await clusterEmbeddings(body.inputs, nClusters);

    return NextResponse.json(clusters);
  } catch (error: any) {
    console.error('Clustering error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 