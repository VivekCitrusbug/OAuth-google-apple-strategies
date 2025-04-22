import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token', // This is a key to identify the security scheme
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Custom Swagger UI options
  const customOptions = {
    swaggerOptions: {
      docExpansion: 'none', // All tags will be closed by default
      defaultModelsExpandDepth: -1, // Hide the models section
      persistAuthorization: true,
      tryItOutEnabled: true, // Enable try it out functionality
      displayOperationId: true,
    },
    customSiteTitle: 'API Documentation',
    swaggerUrl: '/api/json',
    customCss: `
      .swagger-ui .topbar .download-url-wrapper { display: none }
      .swagger-ui .try-out__btn { display: none !important }
    `,
  };

  SwaggerModule.setup('api', app, document, customOptions);

  await app.listen(process.env.PORT ?? 3000);

  const port = process.env.PORT ?? 3000;
  console.log(`Server is running on port ${port}`);
  console.log(
    `Swagger API documentation available at http://localhost:${port}/api`,
  );
}
bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
