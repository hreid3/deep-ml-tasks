import { pipeline, Pipeline } from "@huggingface/transformers";

interface SpamDetectionStatic {
  getInstance(): Promise<Pipeline>;
  detect(text: string): Promise<SpamDetectionResult>;
  detectBatch(texts: string[]): Promise<SpamDetectionResult[]>;
}

declare global {
  // eslint-disable-next-line no-var
  var SpamDetectionPipelineSingleton: SpamDetectionStatic;
}

interface ClassifierResult {
  label: string;
  score: number;
}

export interface SpamDetectionResult {
  spam: boolean;
  probability: number;
}

export class SpamDetectionPipelineSingleton {
  static task = "text-classification";
  static model = "bajrangCoder/roberta_spam_onnx";
  static instance: Pipeline | null = null;

  static async getInstance() {
    if (this.instance === null) {
      // @ts-expect-error - Pipeline type from transformers needs to be properly typed
      this.instance = await pipeline(this.task, this.model, { device: 'cpu' });
    }
    if (!this.instance) throw new Error('Failed to initialize pipeline');
    return this.instance;
  }

  static async detect(text: string): Promise<SpamDetectionResult> {
    const classifier = await this.getInstance();
    const result = await classifier(text);
    const prediction = Array.isArray(result) ? result[0] : result;
    return {
      spam: prediction.label.toUpperCase() === "SPAM",
      probability: prediction.score
    };
  }

  static async detectBatch(texts: string[]): Promise<SpamDetectionResult[]> {
    const classifier = await this.getInstance();
    const results = await classifier(texts);
    
    return results.map((result: ClassifierResult) => ({
      spam: result.label.toUpperCase() === "SPAM",
      probability: result.score
    }));
  }
}

if (process.env.NODE_ENV !== "production" && !global.SpamDetectionPipelineSingleton) {
  global.SpamDetectionPipelineSingleton = SpamDetectionPipelineSingleton;
}

export default (process.env.NODE_ENV === "production" 
  ? SpamDetectionPipelineSingleton 
  : global.SpamDetectionPipelineSingleton); 