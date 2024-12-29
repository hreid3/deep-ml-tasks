import { describe, it, expect } from 'vitest';
import { clusterEmbeddings } from '../../kmeanspp';

describe('clustering behavior', () => {
  it('should handle orthogonal vectors', async () => {
    const inputs = [
      { text: "x1", embedding: [1, 0, 0] },
      { text: "x2", embedding: [0.98, 0.02, 0] },
      { text: "y1", embedding: [0, 1, 0] },
      { text: "y2", embedding: [0.02, 0.98, 0] },
      { text: "z1", embedding: [0, 0, 1] },
      { text: "z2", embedding: [0, 0.02, 0.98] }
    ];

    const result = await clusterEmbeddings(inputs, 3);
    expect(Object.keys(result).length).toBe(3);

    // Points along same axis should be clustered together
    Object.values(result).forEach(cluster => {
      const texts = cluster.map(p => p.text[0]); // Get first letter (x, y, or z)
      expect(new Set(texts).size).toBe(1); // All points in cluster should start with same letter
      expect(cluster.length).toBe(2);
    });
  });

  it('should handle antipodal points', async () => {
    const inputs = [
      { text: "pos_x", embedding: [1, 0] },
      { text: "pos_x2", embedding: [0.98, 0.02] },
      { text: "neg_x", embedding: [-1, 0] },
      { text: "neg_x2", embedding: [-0.98, -0.02] }
    ];

    const result = await clusterEmbeddings(inputs, 2);
    expect(Object.keys(result).length).toBe(2);

    // Opposite points should be in different clusters
    const clusters = Object.values(result);
    expect(clusters[0][0].embedding[0] * clusters[1][0].embedding[0]).toBeLessThan(0);
  });
});

describe('convergence behavior', () => {
  it('should converge quickly for well-separated clusters', async () => {
    const startTime = Date.now();
    const inputs = [
      // Cluster 1
      { text: "a1", embedding: [1, 0] },
      { text: "a2", embedding: [0.99, 0.01] },
      // Cluster 2
      { text: "b1", embedding: [-1, 0] },
      { text: "b2", embedding: [-0.99, -0.01] },
    ];

    const result = await clusterEmbeddings(inputs, 2);
    const endTime = Date.now();
    
    expect(Object.keys(result).length).toBe(2);
    expect(endTime - startTime).toBeLessThan(100); // Should converge quickly
  });

  it('should handle maximum iterations for challenging data', async () => {
    // Create interleaved clusters that are hard to separate
    const inputs = [
      // Cluster 1 - scattered points in positive quadrant
      ...Array.from({ length: 7 }, (_, i) => ({
        text: `a${i}`,
        embedding: [0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5]
      })),
      // Cluster 2 - scattered points in negative quadrant
      ...Array.from({ length: 7 }, (_, i) => ({
        text: `b${i}`,
        embedding: [-0.5 - Math.random() * 0.5, -0.5 - Math.random() * 0.5]
      })),
      // Cluster 3 - points near origin
      ...Array.from({ length: 6 }, (_, i) => ({
        text: `c${i}`,
        embedding: [-0.2 + Math.random() * 0.4, -0.2 + Math.random() * 0.4]
      }))
    ];

    const startTime = Date.now();
    const result = await clusterEmbeddings(inputs, 3);
    const endTime = Date.now();

    expect(Object.keys(result).length).toBe(3);
    expect(endTime - startTime).toBeLessThan(1000);
    expect(Object.values(result).reduce((sum, c) => sum + c.length, 0)).toBe(inputs.length);
  });
}); 