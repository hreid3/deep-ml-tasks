import { ClusterInput, ClusterOutput } from './types';

interface OutlierOptions {
  /**
   * Minimum cluster size. Clusters smaller than this are considered outlier groups
   * (default: 3)
   */
  minClusterSize?: number;

  /**
   * Distance threshold in standard deviations from cluster mean
   * (default: 2)
   */
  stdDevThreshold?: number;
}

/**
 * Calculates the centroid of a set of embeddings
 */
function calculateCentroid(embeddings: number[][]): number[] {
  const dimension = embeddings[0].length;
  const centroid = new Array(dimension).fill(0);
  
  for (const embedding of embeddings) {
    for (let i = 0; i < dimension; i++) {
      centroid[i] += embedding[i];
    }
  }
  
  for (let i = 0; i < dimension; i++) {
    centroid[i] /= embeddings.length;
  }
  
  return centroid;
}

/**
 * Calculates cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Normalize a vector to unit length
 */
function normalizeVector(vec: number[]): number[] {
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return vec.map(val => val / magnitude);
}

/**
 * Post-processes clustering results to identify outliers
 */
export function detectOutliers(
  clusteredResults: ClusterOutput,
  options: OutlierOptions = {}
): ClusterOutput {
  const {
    minClusterSize = 3,
    stdDevThreshold = 2
  } = options;

  const result: ClusterOutput = {};

  // Check if all points across all clusters are similar
  const allPoints = Object.values(clusteredResults).flat();
  const allCentroid = calculateCentroid(allPoints.map(p => p.embedding));
  const allSimilarities = allPoints.map(p => cosineSimilarity(p.embedding, allCentroid));
  const allMean = allSimilarities.reduce((a, b) => a + b, 0) / allSimilarities.length;
  const allVariance = allSimilarities.reduce((a, b) => a + Math.pow(b - allMean, 2), 0) / allSimilarities.length;
  const allStdDev = Math.sqrt(allVariance);

  // If all points are very similar, mark all as non-outliers
  if (allMean > 0.95 && allStdDev < 0.01) {
    for (const [clusterKey, points] of Object.entries(clusteredResults)) {
      result[clusterKey] = points.map(p => ({ ...p, isOutlier: false }));
    }
    return result;
  }

  // Process each cluster normally
  for (const [clusterKey, points] of Object.entries(clusteredResults) as [string, ClusterInput[]][]) {
    result[clusterKey] = [];

    // Calculate cluster centroid and similarities
    const centroid = calculateCentroid(points.map(p => p.embedding));
    const similarities = points.map(p => cosineSimilarity(p.embedding, centroid));

    // Calculate mean and standard deviation
    const mean = similarities.reduce((a, b) => a + b, 0) / similarities.length;
    const variance = similarities.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / similarities.length;
    const stdDev = Math.sqrt(variance);

    // Small clusters are considered outlier groups
    if (points.length < minClusterSize) {
      result[clusterKey] = points.map(p => ({ ...p, isOutlier: true }));
      continue;
    }

    // Normal outlier detection
    points.forEach((point, i) => {
      const similarity = similarities[i];
      // Points with low absolute similarity or far from mean are outliers
      const isOutlier = similarity < 0.8 || (similarity - mean) / (stdDev || 0.0001) < -stdDevThreshold;
      result[clusterKey].push({ ...point, isOutlier });
    });
  }

  return result;
} 