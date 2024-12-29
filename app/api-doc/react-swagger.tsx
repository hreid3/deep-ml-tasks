'use client';

import { useEffect, useRef } from 'react';
import SwaggerUIBundle from 'swagger-ui-dist/swagger-ui-bundle';
import 'swagger-ui-dist/swagger-ui.css';
import './swagger-theme.css';

// OpenAPI specification type
export type OpenAPISpec = {
  openapi?: string;
  info?: {
    title: string;
    version: string;
    [key: string]: unknown;
  };
  paths?: Record<string, unknown>;
  components?: Record<string, unknown>;
  tags?: Array<unknown>;
  [key: string]: unknown;
};

type Props = {
  spec: OpenAPISpec;
};

function ReactSwagger({ spec }: Props) {
  const swaggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (swaggerRef.current) {
      SwaggerUIBundle({
        spec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: -1,
        docExpansion: 'list',
        filter: true,
        tryItOutEnabled: true,
        syntaxHighlight: true,
        displayRequestDuration: true,
        requestSnippetsEnabled: true,
        requestSnippets: {
          generators: {
            curl_bash: { title: "cURL (bash)", syntax: "bash" },
            curl_powershell: { title: "cURL (PowerShell)", syntax: "powershell" }
          }
        }
      });
    }
  }, [spec]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div 
        id="swagger-ui" 
        ref={swaggerRef} 
        className="mx-auto px-1 py-8"
      />
    </div>
  );
}

export default ReactSwagger; 