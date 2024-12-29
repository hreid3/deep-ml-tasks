import path from "path";
import { fileURLToPath } from 'url';
import type { Configuration } from 'webpack';
import type { NextConfig } from 'next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
    experimental: {},
    serverExternalPackages: [
        '@huggingface/transformers',
        'onnxruntime-node',
        'swagger-ui-react',
        '@tensorflow/tfjs-node'
    ],
    webpack: (config: Configuration) => {
        if (!config.resolve) config.resolve = { alias: {} };
        config.resolve.alias = {
            ...config.resolve.alias,
            '@huggingface/transformers': path.resolve(__dirname, 'node_modules/@huggingface/transformers'),
            'swagger-ui-react': path.resolve(__dirname, 'node_modules/swagger-ui-react'),
            '@tensorflow/tfjs-node': path.resolve(__dirname, 'node_modules/@tensorflow/tfjs-node')
        }
        return config;
    },
    async rewrites() {
        return [];
    },
    env: {
        PORT: '8080'
    }
} as NextConfig;

// Setup the development platform in development mode
if (process.env.NODE_ENV === 'development') {
}

export default nextConfig;
