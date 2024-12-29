import { describe, it, expect } from 'vitest';
import { clusterEmbeddings } from '../../kmeanspp';

describe('cluster validity', () => {
  // Helper to calculate average distance between points
  const averageDistance = (points: number[][]) => {
    if (points.length < 2) return 0;
    let sum = 0;
    let count = 0;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = points[i].reduce((acc, val, idx) => 
          acc + Math.pow(val - points[j][idx], 2), 0);
        sum += Math.sqrt(dist);
        count++;
      }
    }
    return sum / count;
  };

  it('should create compact clusters', async () => {
    const inputs = [
      // Three well-defined clusters
      { text: "a1", embedding: [1, 0] },
      { text: "a2", embedding: [0.95, 0.05] },
      { text: "a3", embedding: [0.98, 0.02] },
      
      { text: "b1", embedding: [-1, 0] },
      { text: "b2", embedding: [-0.95, -0.05] },
      { text: "b3", embedding: [-0.98, -0.02] },
      
      { text: "c1", embedding: [0, 1] },
      { text: "c2", embedding: [0.05, 0.95] },
      { text: "c3", embedding: [0.02, 0.98] }
    ];

    const result = await clusterEmbeddings(inputs, 3);
    
    // Check intra-cluster distances
    Object.values(result).forEach(cluster => {
      const intraClusterDist = averageDistance(cluster.map(p => p.embedding));
      expect(intraClusterDist).toBeLessThan(0.2); // Points within cluster should be close
    });
  });

  it('should maintain good inter-cluster separation', async () => {
    const inputs = [
      // Three well-separated clusters
      { text: "a1", embedding: [1, 0] },
      { text: "a2", embedding: [0.9, 0.1] },
      
      { text: "b1", embedding: [-1, 0] },
      { text: "b2", embedding: [-0.9, -0.1] },
      
      { text: "c1", embedding: [0, 1] },
      { text: "c2", embedding: [0.1, 0.9] }
    ];

    const result = await clusterEmbeddings(inputs, 3);
    const clusters = Object.values(result);
    
    // Calculate centroids
    const centroids = clusters.map(cluster => {
      const points = cluster.map(p => p.embedding);
      return points[0].map((_, i) => 
        points.reduce((sum, p) => sum + p[i], 0) / points.length
      );
    });

    // Check inter-cluster distances
    for (let i = 0; i < centroids.length; i++) {
      for (let j = i + 1; j < centroids.length; j++) {
        const dist = Math.sqrt(centroids[i].reduce((acc, val, idx) => 
          acc + Math.pow(val - centroids[j][idx], 2), 0));
        expect(dist).toBeGreaterThan(1.0); // Centroids should be well-separated
      }
    }
  });
}); 