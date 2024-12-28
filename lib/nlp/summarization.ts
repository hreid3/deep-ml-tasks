import { pipeline, Pipeline } from "@huggingface/transformers";

// Use the Singleton pattern to enable lazy initialization of the summarization pipeline.
const SummarizationPipeline = () =>
	class SummarizationPipelineSingleton {
		static task = "summarization"; // Define the summarization task
		static model = "ahmedaeb/distilbart-cnn-6-6-optimised"; // Use a summarization model from Hugging Face
		static instance: Pipeline | null = null; // Holds the initialized pipeline

		/**
		 * Returns a Singleton instance of the summarization pipeline.
		 * @param progress_callback Optional progress callback.
		 */
		static async getInstance(progress_callback = null) {
			if (this.instance === null) {
				// Initialize the pipeline only once.
				// @ts-expect-error - Pipeline type from transformers needs to be properly typed
				this.instance = pipeline(this.task, this.model, { 
					progress_callback,
					device: 'cpu',  // Use CPU for compatibility
					min_length: 30,
					max_length: 130,
				});
			}
			return this.instance;
		}
	};

let SummarizationPipelineSingleton;

// Enable hot reloading in development mode by attaching the pipeline to the global object
if (process.env.NODE_ENV !== "production") {
	// @ts-expect-error - Global type needs to be extended for our singleton
	if (!global.SummarizationPipelineSingleton) {
		// @ts-expect-error - Global type needs to be extended for our singleton
		global.SummarizationPipelineSingleton = SummarizationPipeline();
	}
	// @ts-expect-error - Global type needs to be extended for our singleton
	SummarizationPipelineSingleton = global.SummarizationPipelineSingleton;
} else {
	SummarizationPipelineSingleton = SummarizationPipeline();
}

export default SummarizationPipelineSingleton;
