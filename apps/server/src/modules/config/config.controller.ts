import { Controller, Get } from '@tsuki-hono/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly config: ConfigService) {}

  @Get('/')
  get() {
    return Response.json(this.config.getPublicConfig());
  }
}
