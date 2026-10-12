import 'reflect-metadata';
import { loadDevEnv } from './bootstrap/devEnv';

loadDevEnv();
const { startNodeServer } = await import('./bootstrap/node');
await startNodeServer();
