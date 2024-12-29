import * as tf from '@tensorflow/tfjs';

/**
 * Custom k-means++ initialization
 */
export function kmeansppInit(data: tf.Tensor2D, k: number): tf.Tensor2D {
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
      let sum = 0;
      const probs = distArray.map(d => {
        sum += d;
        return d;
      });
      // Now normalize in place
      for (let i = 0; i < probs.length; i++) {
        probs[i] /= sum;
      }
      
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