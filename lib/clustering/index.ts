import { clusterEmbeddings } from './kmeans';
import { detectOutliers } from './outliers';
import type { ClusterInput, ClusterOutput } from './types';

interface ClusterOptions {
  nClusters?: number;
  minClusterSize?: number;
  stdDevThreshold?: number;
}

export async function clusterAndDetectOutliers(
  inputs: ClusterInput[],
  options: ClusterOptions = {}
): Promise<ClusterOutput> {
  // First perform clustering
  const clusters = await clusterEmbeddings(inputs, {
    nClusters: options.nClusters
  });

  // Then detect outliers
  return detectOutliers(clusters, {
    minClusterSize: options.minClusterSize,
    stdDevThreshold: options.stdDevThreshold
  });
} 