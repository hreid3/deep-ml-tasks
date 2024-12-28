declare module '@stoplight/elements' {
    export const API: React.ComponentType<{
        apiDescriptionDocument: Record<string, any>;
        router?: 'hash' | 'memory' | 'history';
        layout?: 'sidebar' | 'stacked';
    }>;
} 