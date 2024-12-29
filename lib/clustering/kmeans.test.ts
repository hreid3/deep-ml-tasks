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
    // Create three clearly separated clusters using unit vectors
    const cluster1 = [
      { text: "point1", embedding: [1, 0] },
      { text: "point2", embedding: [0.99, 0.01] },
      { text: "point3", embedding: [0.98, 0.02] }
    ];

    const cluster2 = [
      { text: "point4", embedding: [0, 1] },
      { text: "point5", embedding: [0.01, 0.99] },
      { text: "point6", embedding: [0.02, 0.98] }
    ];

    const cluster3 = [
      { text: "point7", embedding: [-1, 0] },
      { text: "point8", embedding: [-0.99, -0.01] },
      { text: "point9", embedding: [-0.98, -0.02] }
    ];

    const inputs = [...cluster1, ...cluster2, ...cluster3];
    const result = await clusterEmbeddings(inputs, 3);

    expect(Object.keys(result).length).toBe(3);

    // Each original cluster should be preserved intact
    Object.values(result).forEach(cluster => {
      // Each point in a cluster should be from the same original cluster
      const points = cluster.map(point => point.embedding[0]); // Look at x coordinates
      const isCluster1 = points.every(x => x > 0.9);  // Around [1,0]
      const isCluster2 = points.every(x => Math.abs(x) < 0.1);  // Around [0,1]
      const isCluster3 = points.every(x => x < -0.9);  // Around [-1,0]
      
      expect(isCluster1 || isCluster2 || isCluster3).toBe(true);
      expect(cluster.length).toBe(3);
    });
  });

  it('should handle angular clusters', async () => {
    // Create two clearly separated angular sectors
    const sector1 = Array.from({ length: 4 }, (_, i) => {
      const angle = (i / 4) * Math.PI / 4; // 0 to π/4
      return {
        text: `sector1_${i}`,
        embedding: [Math.cos(angle), Math.sin(angle)]
      };
    });

    const sector2 = Array.from({ length: 4 }, (_, i) => {
      const angle = Math.PI + (i / 4) * Math.PI / 4; // π to 5π/4
      return {
        text: `sector2_${i}`,
        embedding: [Math.cos(angle), Math.sin(angle)]
      };
    });

    const result = await clusterEmbeddings([...sector1, ...sector2], 2);
    expect(Object.keys(result).length).toBe(2);

    // Check that points are separated by angle
    Object.values(result).forEach(cluster => {
      const angles = cluster.map(p => {
        let angle = Math.atan2(p.embedding[1], p.embedding[0]);
        if (angle < 0) angle += 2 * Math.PI; // Convert to [0, 2π]
        return angle;
      });
      
      // Points in same cluster should be close to each other
      const maxAngleDiff = Math.max(...angles) - Math.min(...angles);
      expect(maxAngleDiff).toBeLessThan(Math.PI / 2);
      expect(cluster.length).toBe(4);
    });
  });
});

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

describe('realistic scenarios', () => {
  it('should handle noisy data gracefully', async () => {
    // Create base clusters
    const basePoints = [
      // Cluster 1 centered at [1, 0]
      { text: "a1", embedding: [1, 0] },
      { text: "a2", embedding: [0.9, 0.1] },
      // Cluster 2 centered at [-1, 0]
      { text: "b1", embedding: [-1, 0] },
      { text: "b2", embedding: [-0.9, -0.1] }
    ];

    // Add noise to create test points
    const noisyPoints = basePoints.map(point => ({
      text: `noisy_${point.text}`,
      embedding: point.embedding.map(x => x + (Math.random() - 0.5) * 0.2) // Add ±0.1 noise
    }));

    const inputs = [...basePoints, ...noisyPoints];
    const result = await clusterEmbeddings(inputs, 2);

    // Basic validity checks
    expect(Object.keys(result).length).toBe(2);
    
    // Check that noisy points are assigned to the nearest base cluster
    Object.values(result).forEach(cluster => {
      const avgX = cluster.reduce((sum, p) => sum + p.embedding[0], 0) / cluster.length;
      // Points should be clustered roughly by sign of x-coordinate
      if (avgX > 0) {
        cluster.forEach(p => expect(p.embedding[0]).toBeGreaterThan(-0.3));
      } else {
        cluster.forEach(p => expect(p.embedding[0]).toBeLessThan(0.3));
      }
    });
  });

  it('should handle outliers appropriately', async () => {
    const inputs = [
      // Main cluster around origin
      { text: "c1", embedding: [0.1, 0] },
      { text: "c2", embedding: [-0.1, 0] },
      { text: "c3", embedding: [0, 0.1] },
      { text: "c4", embedding: [0, -0.1] },
      
      // Outliers
      { text: "o1", embedding: [2, 2] },    // Far outlier
      { text: "o2", embedding: [-2, -2] },  // Far outlier
      { text: "o3", embedding: [0, 2] }     // Moderate outlier
    ];

    const result = await clusterEmbeddings(inputs, 2);
    
    // Should form reasonable clusters despite outliers
    expect(Object.keys(result).length).toBe(2);

    // Find the main cluster (should have most points)
    const mainCluster = Object.values(result)
      .find(cluster => cluster.length >= 4);
    expect(mainCluster).toBeDefined();

    // Main cluster should be compact
    if (mainCluster) {
      const distances = mainCluster.map(p => 
        Math.sqrt(p.embedding[0]**2 + p.embedding[1]**2)
      );
      const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
      expect(avgDistance).toBeLessThan(0.2); // Main cluster should be near origin
    }
  });
}); 