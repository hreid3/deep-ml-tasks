import * as tf from '@tensorflow/tfjs';
import { ClusterInput, ClusterOutput } from '../types';
import { kmeansppInit } from './init';
import { kmeansClustering } from './cluster';

interface ClusteringOptions {
  nClusters?: number;
  minClusterSize?: number;   // Minimum points per cluster
}

/**
 * Performs k-means++ clustering on text embeddings
 */
export async function clusterEmbeddings(
  inputs: ClusterInput[],
  options: ClusteringOptions | number = {}
): Promise<ClusterOutput> {
  const opts = typeof options === 'number' ? { nClusters: options } : options;
  const { nClusters = 3 } = opts;

  if (!inputs.length) throw new Error('Input array cannot be empty');

  // 1) Validate embedding dimensions
  const embeddingLength = inputs[0].embedding.length;
  if (!inputs.every(input => input.embedding.length === embeddingLength)) {
    throw new Error('All embeddings must have the same length');
  }

  // Check for identical embeddings (special case)
  const firstEmbedding = inputs[0].embedding;
  const allIdentical = inputs.every(input => 
    input.embedding.length === firstEmbedding.length &&
    input.embedding.every((val, i) => Math.abs(val - firstEmbedding[i]) < 1e-6)
  );
  
  if (allIdentical) {
    // Return a single cluster if everything is identical
    return { 'cluster_0': inputs.map(input => ({
      text: input.text,
      embedding: input.embedding,
      isOutlier: false
    }))};
  }

  // Check for very similar embeddings (special case)
  const allSimilar = inputs.every(input => {
    const similarity = input.embedding.reduce((sum, val, i) => sum + val * firstEmbedding[i], 0) /
      (Math.sqrt(input.embedding.reduce((sum, val) => sum + val * val, 0)) * 
       Math.sqrt(firstEmbedding.reduce((sum, val) => sum + val * val, 0)));
    return similarity > 0.95;
  });

  if (allSimilar && nClusters === 1) {
    // Return a single cluster if all points are very similar and explicitly requested 1 cluster
    return { 'cluster_0': inputs.map(input => ({
      text: input.text,
      embedding: input.embedding,
      isOutlier: false
    }))};
  }

  // 2) Enforce cluster count limits
  const effectiveNClusters = Math.min(
    Math.max(2, nClusters), 
    Math.min(6, inputs.length)
  );

  // 4) Run k-means in a tf.tidy block
  const [labels, centroids] = tf.tidy(() => {
    const embeddings = tf.tensor2d(inputs.map(input => input.embedding));
    const initialCentroids = kmeansppInit(embeddings, effectiveNClusters);

    // First run k-means to get cluster assignments
    const [assignments, fittedCentroids] = kmeansClustering(
      embeddings, 
      initialCentroids
    );

    return [assignments, fittedCentroids];
  });

  // 5) Build final result
  const result: ClusterOutput = {};

  // Initialize all clusters
  for (let i = 0; i < effectiveNClusters; i++) {
    result[`cluster_${i}`] = [];
  }

  // Assign points to clusters
  const labelArray = labels.arraySync() as number[];
  labelArray.forEach((label, i) => {
    const clusterKey = `cluster_${label % effectiveNClusters}`;
    
    // Create a copy of the input
    const point = {
      text: inputs[i].text,
      embedding: inputs[i].embedding,
    };

    // Always assign to a cluster
    result[clusterKey].push(point);
  });

  // Clean up
  labels.dispose();
  centroids.dispose();

  return result;
} 