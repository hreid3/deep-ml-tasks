import { describe, it, expect } from 'vitest';
import * as tf from '@tensorflow/tfjs';
import { clusterEmbeddings } from './kmeans';

describe('clusterEmbeddings', () => {
  // Helper function to generate random embeddings
  const generateRandomEmbeddings = (n: number, dim: number) => {
    return Array.from({ length: n }, (_, i) => ({
      text: `Text ${i + 1}`,
      embedding: Array.from({ length: dim }, () => Math.random())
    }));
  };

  // Helper function to calculate cosine similarity
  const cosineSimilarity = (a: number[], b: number[]) => {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normA * normB);
  };

  it('should cluster similar items together', async () => {
    // Create three distinct groups of similar embeddings
    const group1 = [
      { text: "sales meeting", embedding: [0.9, 0.1, 0.1] },
      { text: "revenue discussion", embedding: [0.85, 0.15, 0.1] }
    ];
    
    const group2 = [
      { text: "lunch break", embedding: [0.1, 0.9, 0.1] },
      { text: "team lunch", embedding: [0.15, 0.85, 0.1] }
    ];
    
    const group3 = [
      { text: "code review", embedding: [0.1, 0.1, 0.9] },
      { text: "technical review", embedding: [0.15, 0.1, 0.85] }
    ];

    const inputs = [...group1, ...group2, ...group3];
    const result = await clusterEmbeddings(inputs, 3);

    // Check that we have exactly 3 clusters
    expect(Object.keys(result).length).toBe(3);

    // Check that each cluster has 2 items
    Object.values(result).forEach(cluster => {
      expect(cluster.length).toBe(2);
    });

    // Check that similar items are in the same cluster
    Object.values(result).forEach(cluster => {
      const similarities = cluster.flatMap((item1, i) => 
        cluster.slice(i + 1).map(item2 => 
          cosineSimilarity(item1.embedding, item2.embedding)
        )
      );
      
      // Items in same cluster should have high similarity
      similarities.forEach(sim => {
        expect(sim).toBeGreaterThan(0.9);
      });
    });
  });

  it('should handle edge case with minimum number of clusters', async () => {
    const inputs = generateRandomEmbeddings(5, 3);
    const result = await clusterEmbeddings(inputs, 1); // Try with 1, should use minimum of 2
    expect(Object.keys(result).length).toBe(2);
  });

  it('should handle edge case with maximum number of clusters', async () => {
    const inputs = generateRandomEmbeddings(10, 3);
    const result = await clusterEmbeddings(inputs, 10); // Try with 10, should use maximum of 6
    expect(Object.keys(result).length).toBe(6);
  });

  it('should maintain all input items in output', async () => {
    const inputs = generateRandomEmbeddings(8, 3);
    const result = await clusterEmbeddings(inputs, 3);
    
    const totalItemsInClusters = Object.values(result)
      .reduce((sum, cluster) => sum + cluster.length, 0);
    
    expect(totalItemsInClusters).toBe(inputs.length);
  });

  it('should handle high-dimensional embeddings', async () => {
    const inputs = generateRandomEmbeddings(10, 384); // Test with BERT-like dimensions
    const result = await clusterEmbeddings(inputs, 3);
    
    expect(Object.keys(result).length).toBe(3);
  });

  it('should throw error for empty input', async () => {
    await expect(clusterEmbeddings([], 3)).rejects.toThrow('Input array cannot be empty');
  });

  it('should throw error for inconsistent embedding dimensions', async () => {
    const inputs = [
      { text: "test1", embedding: [0.1, 0.2, 0.3] },
      { text: "test2", embedding: [0.1, 0.2] } // Different dimension
    ];
    
    await expect(clusterEmbeddings(inputs, 3))
      .rejects.toThrow('All embeddings must have the same length');
  });

  it('should properly clean up tensors', async () => {
    const startingTensors = tf.memory().numTensors;
    const inputs = generateRandomEmbeddings(10, 3);
    
    await clusterEmbeddings(inputs, 3);
    
    // Check that all tensors were properly disposed
    expect(tf.memory().numTensors).toBe(startingTensors);
  });

  it('should correctly separate distinct clusters', async () => {
    // Create three clearly separated clusters in 2D space
    const cluster1 = [
      { text: "point1", embedding: [0, 0] },
      { text: "point2", embedding: [0.1, 0.1] },
      { text: "point3", embedding: [0.2, 0] }
    ];

    const cluster2 = [
      { text: "point4", embedding: [10, 10] },
      { text: "point5", embedding: [10.1, 10.1] },
      { text: "point6", embedding: [10.2, 10] }
    ];

    const cluster3 = [
      { text: "point7", embedding: [-10, -10] },
      { text: "point8", embedding: [-10.1, -10.1] },
      { text: "point9", embedding: [-10.2, -10] }
    ];

    const inputs = [...cluster1, ...cluster2, ...cluster3];
    const result = await clusterEmbeddings(inputs, 3);

    // Check that we have 3 clusters
    expect(Object.keys(result).length).toBe(3);

    // Each original cluster should be preserved intact
    Object.values(result).forEach(cluster => {
      // Each point in a cluster should be from the same original cluster
      const points = cluster.map(point => point.embedding[0]); // Look at x coordinates
      const isCluster1 = points.every(x => Math.abs(x) < 1);
      const isCluster2 = points.every(x => Math.abs(x - 10) < 1);
      const isCluster3 = points.every(x => Math.abs(x + 10) < 1);
      
      expect(isCluster1 || isCluster2 || isCluster3).toBe(true);
      expect(cluster.length).toBe(3);
    });
  });
}); 