import { describe, it, expect } from 'vitest';
import { clusterEmbeddings } from '../../kmeanspp';

describe('degenerate cases', () => {
  it('should handle identical embeddings', async () => {
    const inputs = Array.from({ length: 5 }, (_, i) => ({
      text: `point${i}`,
      embedding: [0.5, 0.5] // All points at the same location
    }));

    const result = await clusterEmbeddings(inputs, 3);
    
    // Should create a single cluster with all points
    expect(Object.keys(result).length).toBe(1);
    const cluster = Object.values(result)[0];
    expect(cluster.length).toBe(inputs.length);
    
    // All points should have identical embeddings
    const firstEmbedding = cluster[0].embedding;
    cluster.forEach(point => {
      expect(point.embedding).toEqual(firstEmbedding);
    });
  });

  it('should handle approximately collinear embeddings', async () => {
    // Create three groups with small variations in y-coordinate
    const inputs = [
      // Left group
      { text: "l1", embedding: [-1, 0.1] },
      { text: "l2", embedding: [-0.9, 0.12] },
      { text: "l3", embedding: [-0.8, 0.08] },
      
      // Center group
      { text: "c1", embedding: [-0.1, -0.1] },
      { text: "c2", embedding: [0, -0.08] },
      { text: "c3", embedding: [0.1, -0.12] },
      
      // Right group
      { text: "r1", embedding: [0.8, 0.05] },
      { text: "r2", embedding: [0.9, -0.05] },
      { text: "r3", embedding: [1.0, 0] }
    ];

    const result = await clusterEmbeddings(inputs, 3);
    
    // Basic validity checks
    expect(Object.keys(result).length).toBe(3);
    expect(Object.values(result)
      .reduce((sum, cluster) => sum + cluster.length, 0))
      .toBe(inputs.length);
  });

  it('should handle near-zero variance embeddings', async () => {
    const inputs = Array.from({ length: 6 }, (_, i) => ({
      text: `point${i}`,
      embedding: [1 + Math.random() * 1e-10, 1 + Math.random() * 1e-10] // Tiny variations
    }));

    const result = await clusterEmbeddings(inputs, 2);
    
    // Should not crash and should return valid clusters
    expect(Object.keys(result).length).toBeGreaterThanOrEqual(1);
    expect(Object.values(result)
      .reduce((sum, cluster) => sum + cluster.length, 0))
      .toBe(inputs.length);
  });
}); 