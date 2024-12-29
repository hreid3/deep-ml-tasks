import { describe, it, expect } from 'vitest';
import { clusterAndDetectOutliers } from '../..';

describe('clusterAndDetectOutliers', () => {
  it('should identify outliers in clusters', async () => {
    const inputs = [
      { text: 'c1_1', embedding: [1, 0] },
      { text: 'c1_2', embedding: [0.9, 0.1] },
      { text: 'c1_3', embedding: [1.1, -0.1] },
      { text: 'c1_outlier', embedding: [0.2, 0.2] },
      { text: 'c2_1', embedding: [0, 1] },
      { text: 'c2_2', embedding: [0.1, 0.9] },
      { text: 'c2_3', embedding: [-0.1, 1.1] },
      { text: 'c2_outlier', embedding: [-0.8, 0.5] },
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
    expect(outliers.map(o => o.text)).toContain('c1_outlier');
    expect(outliers.map(o => o.text)).toContain('c2_outlier');
  });

  it('should mark small clusters as outliers', async () => {
    const inputs = [
      { text: 'c1_1', embedding: [1, 0] },
      { text: 'c1_2', embedding: [0.9, 0.1] },
      { text: 'c1_3', embedding: [1.1, -0.1] },
      { text: 'c2_1', embedding: [0, 1] },
      { text: 'c2_2', embedding: [0.1, 0.9] },
    ];

    const result = await clusterAndDetectOutliers(inputs, {
      nClusters: 2,
      minClusterSize: 3,
    });

    // Check that we have 2 clusters
    expect(Object.keys(result).length).toBe(2);

    // Count outliers
    const outliers = Object.values(result)
      .flat()
      .filter(p => p.isOutlier);

    expect(outliers.length).toBe(2);
    expect(outliers.map(o => o.text)).toContain('c2_1');
    expect(outliers.map(o => o.text)).toContain('c2_2');
  });

  it('should handle edge case with all similar points', async () => {
    const inputs = [
      { text: '1', embedding: [1, 0] },
      { text: '2', embedding: [0.99, 0.01] },
      { text: '3', embedding: [1.01, -0.01] },
    ];

    const result = await clusterAndDetectOutliers(inputs, {
      nClusters: 1,  // Force single cluster for similar points
      stdDevThreshold: 2
    });

    // Check that we have 1 cluster
    expect(Object.keys(result).length).toBe(1);

    // Count outliers - should be none since all points are similar
    const outliers = Object.values(result)
      .flat()
      .filter(p => p.isOutlier);

    expect(outliers.length).toBe(0);
  });
}); 