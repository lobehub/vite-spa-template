import { getRequestListener } from '@hono/node-server';
import { createApp } from '../app.factory';

export async function createVercelHandler() {
  const app = await createApp();
  return getRequestListener(app.getInstance().fetch);
}
