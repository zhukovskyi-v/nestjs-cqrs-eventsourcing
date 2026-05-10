import { Controller, Get, Header } from '@nestjs/common';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { folderContract } from '@repo/contracts';

const contract = {
  folder: folderContract,
};

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

@Controller()
export class DocsController {
  @Get('spec.json')
  spec() {
    return generator.generate(contract, {
      info: { title: 'Folders API', version: '0.0.1' },
      servers: [{ url: '/api' }],
    });
  }

  @Get('docs')
  @Header('Content-Type', 'text/html')
  docs(): string {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Folders API Reference</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/api/spec.json"
      data-configuration='{"theme":"default"}'
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
  }
}
