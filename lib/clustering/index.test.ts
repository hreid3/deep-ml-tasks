import { describe, it, expect } from 'vitest';
import { clusterAndDetectOutliers } from './index';

describe('clusterAndDetectOutliers', () => {
  it('should identify outliers in clusters', async () => {
    const inputs = [
      // Cluster 1: tight group
      { text: "c1_1", embedding: [1, 0] },
      { text: "c1_2", embedding: [0.98, 0.02] },
      { text: "c1_3", embedding: [0.99, 0.01] },
      // Cluster 1 outlier - much further away
      { text: "c1_outlier", embedding: [0.2, 0.2] },

      // Cluster 2: tight group
      { text: "c2_1", embedding: [0, 1] },
      { text: "c2_2", embedding: [0.02, 0.98] },
      { text: "c2_3", embedding: [0.01, 0.99] },
      // Cluster 2 outlier - much further away
      { text: "c2_outlier", embedding: [-0.8, 0.5] },
    ];

    const result = await clusterAndDetectOutliers(inputs, {
      nClusters: 2,
      stdDevThreshold: 1.5  // Lower threshold to catch more outliers
    });

    // Check that we have 2 clusters
    expect(Object.keys(result).length).toBe(2);

    // Count outliers
    const outliers = Object.values(result)
      .flat()
      .filter(p => p.isOutlier);
    expect(outliers.length).toBe(2);
    expect(outliers.map(o => o.text).sort())
      .toEqual(['c1_outlier', 'c2_outlier'].sort());
  });

  it('should mark small clusters as outliers', async () => {
    const inputs = [
      // Main cluster - clearly separated
      { text: "main1", embedding: [1, 0] },
      { text: "main2", embedding: [0.98, 0.02] },
      { text: "main3", embedding: [0.99, 0.01] },
      { text: "main4", embedding: [0.97, 0.03] },
      
      // Small cluster - very different direction
      { text: "small1", embedding: [-1, 0] },
      { text: "small2", embedding: [-0.98, 0.02] },
    ];

    const result = await clusterAndDetectOutliers(inputs, {
      nClusters: 2,
      minClusterSize: 3,
      stdDevThreshold: 1.5
    });

    const outliers = Object.values(result)
      .flat()
      .filter(p => p.isOutlier);

    expect(outliers.length).toBe(2);
    expect(outliers.map(o => o.text).sort())
      .toEqual(['small1', 'small2'].sort());
  });

  it('should handle edge case with all similar points', async () => {
    const inputs = [
      { text: "p1", embedding: [1, 0] },
      { text: "p2", embedding: [0.99, 0.01] },
      { text: "p3", embedding: [0.98, 0.02] },
    ];

    const result = await clusterAndDetectOutliers(inputs, {
      nClusters: 1,  // Force single cluster for similar points
      stdDevThreshold: 2
    });

    const outliers = Object.values(result)
      .flat()
      .filter(p => p.isOutlier);
    expect(outliers.length).toBe(0);
  });
}); 