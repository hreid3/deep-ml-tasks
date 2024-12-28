import { pipeline, env, Pipeline } from '@huggingface/transformers';

// Set Hugging Face token if available
if (process.env.HUGGING_FACE_TOKEN) {
    // @ts-expect-error - env type from transformers needs to be extended
    env.token = process.env.HUGGING_FACE_TOKEN;
}

interface FeatureExtractionClass {
    pipeline: Pipeline | null;
    getInstance(): Promise<Pipeline>;
    generateEmbedding(text: string): Promise<number[]>;
}

const FeatureExtractionPipeline = () =>
    class FeatureExtractionPipelineSingleton implements FeatureExtractionClass {
        pipeline: Pipeline | null = null;
        model = process.env.NLP_MODEL_EMBEDDINGS || "Xenova/all-minilm-l6-v2";

        async getInstance(): Promise<Pipeline> {
            if (this.pipeline === null) {
                // @ts-expect-error - Pipeline type from transformers needs to be properly typed
                this.pipeline = await pipeline('feature-extraction', this.model, {
                    revision: 'main'
                });
            }
            if (!this.pipeline) throw new Error('Failed to initialize pipeline');
            return this.pipeline;
        }

        async generateEmbedding(text: string): Promise<number[]> {
            const extractor = await this.getInstance();
            const output = await extractor(text, { pooling: 'mean', normalize: true });
            return Array.from(output.data);
        }
    };

let FeatureExtractionPipelineSingleton: ReturnType<typeof FeatureExtractionPipeline>;

// Enable hot reloading in development mode
if (process.env.NODE_ENV !== "production") {
    // @ts-expect-error - Global type needs to be extended for our singleton
    if (!global.FeatureExtractionPipelineSingleton) {
        // @ts-expect-error - Global type needs to be extended for our singleton
        global.FeatureExtractionPipelineSingleton = FeatureExtractionPipeline();
    }
    // @ts-expect-error - Global type needs to be extended for our singleton
    FeatureExtractionPipelineSingleton = global.FeatureExtractionPipelineSingleton;
} else {
    FeatureExtractionPipelineSingleton = FeatureExtractionPipeline();
}

export { FeatureExtractionPipelineSingleton }; 