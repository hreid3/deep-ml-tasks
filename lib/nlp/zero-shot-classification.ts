import { pipeline, Pipeline } from "@huggingface/transformers";

declare global {
  var ZeroShotClassificationPipelineSingleton: any;
}

interface ClassificationResult {
  category: string;
  score: number;
}

export class ZeroShotClassificationPipelineSingleton {
  static task = "zero-shot-classification";
  static model = "Xenova/nli-deberta-v3-xsmall";
  static instance: Pipeline | null = null;

  static async getInstance() {
    if (this.instance === null) {
      // @ts-expect-error - Pipeline type from transformers needs to be properly typed
      this.instance = await pipeline(this.task, this.model, { device: 'cpu' });
    }
    if (!this.instance) throw new Error('Failed to initialize pipeline');
    return this.instance;
  }

  static async classify(text: string, categories: string[], topN: number = 3) {
    const classifier = await this.getInstance();
    const result = await classifier(text, categories);
    
    const scores: ClassificationResult[] = result.labels.map((label: string, index: number) => ({
      category: label,
      score: result.scores[index]
    }));

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }
}

if (process.env.NODE_ENV !== "production" && !global.ZeroShotClassificationPipelineSingleton) {
  global.ZeroShotClassificationPipelineSingleton = ZeroShotClassificationPipelineSingleton;
}

export default (process.env.NODE_ENV === "production" 
  ? ZeroShotClassificationPipelineSingleton 
  : global.ZeroShotClassificationPipelineSingleton); 
