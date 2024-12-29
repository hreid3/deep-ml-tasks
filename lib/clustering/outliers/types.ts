import { ClusterOutput } from '../types';

/**
 * Options for outlier detection
 */
export interface OutlierOptions {
  /**
   * Minimum cluster size. Clusters smaller than this are considered outlier groups
   * (default: 3)
   */
  minClusterSize?: number;

  /**
   * Distance threshold in standard deviations from cluster mean
   * (default: 2)
   */
  stdDevThreshold?: number;
} 