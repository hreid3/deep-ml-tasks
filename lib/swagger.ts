import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Deep ML Tasks API',
        version: '1.0',
        description: 'API documentation for Deep ML Tasks',
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [],
    },
  });
  return spec;
}; 