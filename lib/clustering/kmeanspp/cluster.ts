import * as tf from '@tensorflow/tfjs';

/**
 * Performs k-means clustering iterations
 */
export function kmeansClustering(data: tf.Tensor2D, centroids: tf.Tensor2D, maxIter: number = 100): [tf.Tensor1D, tf.Tensor2D] {
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
        const newCentroids: tf.Tensor1D[] = [];
        
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