import * as tf from '@tensorflow/tfjs';

interface ClusterInput {
  text: string;
  embedding: number[];
}

interface ClusterOutput {
  [key: string]: ClusterInput[];
}

/**
 * Custom k-means++ initialization
 */
function kmeansppInit(data: tf.Tensor2D, k: number): tf.Tensor2D {
  return tf.tidy(() => {
    const numPoints = data.shape[0];
    const centroids: number[][] = [];
    
    // Choose first centroid randomly
    const firstIdx = Math.floor(Math.random() * numPoints);
    centroids.push(data.slice([firstIdx, 0], [1, data.shape[1]]).arraySync()[0]);

    // Choose remaining centroids
    while (centroids.length < k) {
      const centroidsTensor = tf.tensor2d(centroids);
      const distances = tf.tidy(() => {
        const expandedPoints = tf.expandDims(data, 1) as tf.Tensor3D;
        const expandedCentroids = tf.expandDims(centroidsTensor, 0) as tf.Tensor3D;
        const squaredDiff = tf.square(tf.sub(expandedPoints, expandedCentroids));
        const distances = tf.sum(squaredDiff, -1) as tf.Tensor2D;
        return tf.min(distances, 1) as tf.Tensor1D;
      });

      // Convert to probabilities and select next centroid
      const distArray = distances.arraySync() as number[];
      const sum = distArray.reduce((a, b) => a + b, 0);
      const probs = distArray.map(d => d / sum);
      
      let r = Math.random();
      let idx = 0;
      while (r > 0 && idx < probs.length) {
        r -= probs[idx];
        idx++;
      }
      idx = Math.max(0, idx - 1);
      
      centroids.push(data.slice([idx, 0], [1, data.shape[1]]).arraySync()[0]);
      
      // Cleanup
      centroidsTensor.dispose();
      distances.dispose();
    }
    
    return tf.tensor2d(centroids);
  });
}

/**
 * Performs k-means clustering iterations
 */
function kmeansClustering(data: tf.Tensor2D, centroids: tf.Tensor2D, maxIter: number = 100): [tf.Tensor1D, tf.Tensor2D] {
  return tf.tidy(() => {
    let oldCentroids: tf.Tensor2D | null = null;
    let iteration = 0;
    
    // Initialize assignments
    let currentAssignments = tf.tidy(() => {
      const expandedPoints = tf.expandDims(data, 1) as tf.Tensor3D;
      const expandedCentroids = tf.expandDims(centroids, 0) as tf.Tensor3D;
      const squaredDiff = tf.square(tf.sub(expandedPoints, expandedCentroids));
      const distances = tf.sum(squaredDiff, -1) as tf.Tensor2D;
      return tf.argMin(distances, 1) as tf.Tensor1D;
    });

    while (iteration < maxIter) {
      // Update centroids
      oldCentroids = centroids;
      centroids = tf.tidy(() => {
        const numClusters = centroids.shape[0];
        const newCentroids = [];
        
        for (let i = 0; i < numClusters; i++) {
          const mask = tf.equal(currentAssignments, i);
          const pointsWithMask = data.mul(tf.expandDims(mask, 1)) as tf.Tensor2D;
          const sum = tf.sum(pointsWithMask, 0) as tf.Tensor1D;
          const count = tf.sum(tf.cast(mask, 'float32')).arraySync() as number;
          if (count > 0) {
            newCentroids.push(tf.div(sum, tf.scalar(count)) as tf.Tensor1D);
          } else {
            newCentroids.push(oldCentroids!.slice([i, 0], [1, data.shape[1]]).reshape([-1]) as tf.Tensor1D);
          }
        }
        
        return tf.stack(newCentroids) as tf.Tensor2D;
      });

      // Check convergence
      if (oldCentroids !== null) {
        const change = tf.sum(tf.square(tf.sub(centroids, oldCentroids!))).arraySync() as number;
        if (change < 1e-6) {
          oldCentroids!.dispose();
          return [currentAssignments, centroids];
        }
        oldCentroids!.dispose();
      }
      
      // Update assignments
      const newAssignments = tf.tidy(() => {
        const expandedPoints = tf.expandDims(data, 1) as tf.Tensor3D;
        const expandedCentroids = tf.expandDims(centroids, 0) as tf.Tensor3D;
        const squaredDiff = tf.square(tf.sub(expandedPoints, expandedCentroids));
        const distances = tf.sum(squaredDiff, -1) as tf.Tensor2D;
        return tf.argMin(distances, 1) as tf.Tensor1D;
      });
      
      currentAssignments.dispose();
      currentAssignments = newAssignments;
      
      iteration++;
    }
    
    return [currentAssignments, centroids];
  });
}

/**
 * Performs k-means++ clustering on text embeddings
 */
export async function clusterEmbeddings(
  inputs: ClusterInput[],
  nClusters: number = 3
): Promise<ClusterOutput> {
  if (!inputs.length) throw new Error('Input array cannot be empty');

  const embeddingLength = inputs[0].embedding.length;
  if (!inputs.every(input => input.embedding.length === embeddingLength)) {
    throw new Error('All embeddings must have the same length');
  }

  nClusters = Math.min(Math.max(2, nClusters), Math.min(6, inputs.length));

  const [labels] = tf.tidy(() => {
    const embeddings = tf.tensor2d(inputs.map(input => input.embedding));
    const normalizedEmbeddings = tf.div(embeddings, tf.norm(embeddings, 2, 1, true)) as tf.Tensor2D;
    const initialCentroids = kmeansppInit(normalizedEmbeddings, nClusters);
    return kmeansClustering(normalizedEmbeddings, initialCentroids);
  });

  // Create result outside tidy
  const result: ClusterOutput = {};
  const labelArray = labels.arraySync() as number[];
  
  labelArray.forEach((label, index) => {
    const clusterKey = `cluster_${label}`;
    if (!result[clusterKey]) result[clusterKey] = [];
    result[clusterKey].push(inputs[index]);
  });

  labels.dispose();
  return result;
} 