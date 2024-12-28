import ReactSwagger from './react-swagger';
import { createSwaggerSpec } from 'next-swagger-doc';
import type { OpenAPISpec } from './react-swagger';

export default function ApiDoc() {
  const spec = createSwaggerSpec({
    apiFolder: 'app',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Deep ML Tasks API',
        version: '1.0.0'
      },
      paths: {},
      components: {},
      tags: []
    },
  }) as OpenAPISpec;

  return (
    <section className="container mx-auto">
      <ReactSwagger spec={spec} />
    </section>
  );
} 