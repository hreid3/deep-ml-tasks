import { NextResponse } from 'next/server'
// @ts-expect-error - Import path alias needs to be configured
import SummarizationPipelineSingleton from '@/lib/nlp/summarization'

/**
 * @swagger
 * /nlp/summarize:
 *   post:
 *     summary: Generate a concise summary of input text
 *     description: |
 *       Takes a long text input and generates a shorter, coherent summary while preserving key information.
 *       Uses state-of-the-art transformer models for abstractive summarization.
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
 *                 type: string
 *                 description: The text content to be summarized
 *                 example: "Climate change is one of the most pressing challenges facing our planet today..."
 *     responses:
 *       200:
 *         description: Successfully generated summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary_text:
 *                   type: string
 *                   description: The generated summary
 *       400:
 *         description: Missing or invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
// @ts-expect-error - Request type needs to be properly typed for Next.js route handlers
export async function POST(request) {
	const { text } = await request.json();
	if (!text) {
		return NextResponse.json({
			error: 'Missing text parameter',
		}, { status: 400 });
	}
	// Get the summarization pipeline. When called for the first time,
	// this will load the pipeline and cache it for future use.
	// @ts-expect-error - Pipeline instance needs proper typing
	const summarizer = await SummarizationPipelineSingleton.getInstance();
	// Perform the summarization
	const result = await summarizer(text);

	return NextResponse.json(result);
}