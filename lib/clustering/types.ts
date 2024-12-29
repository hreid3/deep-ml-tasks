export interface ClusterInput {
  text: string;
  embedding: number[];
  isOutlier?: boolean;
}

export interface ClusterOutput {
  [key: string]: ClusterInput[];
} 