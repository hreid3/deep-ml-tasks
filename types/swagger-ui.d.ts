declare module 'swagger-ui-dist/swagger-ui-bundle' {
    interface SwaggerUIConfig {
        spec: Record<string, any>;
        dom_id: string;
        deepLinking?: boolean;
        presets?: any[];
        layout?: string;
        defaultModelsExpandDepth?: number;
        docExpansion?: 'list' | 'full' | 'none';
        filter?: boolean;
        tryItOutEnabled?: boolean;
        syntaxHighlight?: boolean;
        highlightSyntax?: boolean;
        displayRequestDuration?: boolean;
        requestSnippetsEnabled?: boolean;
        requestSnippets?: {
            generators: {
                [key: string]: {
                    title: string;
                    syntax: string;
                };
            };
        };
    }

    interface SwaggerUIBundle {
        (config: SwaggerUIConfig): void;
        presets: {
            apis: any[];
        };
        SwaggerUIStandalonePreset: any[];
    }

    const SwaggerUIBundle: SwaggerUIBundle;
    export default SwaggerUIBundle;
}

declare module 'swagger-ui-dist/swagger-ui.css'; 