import { Module } from '@tsuki-hono/common';
import { ConfigModule } from './modules/config/config.module';

@Module({ imports: [ConfigModule] })
export class AppModule {}
