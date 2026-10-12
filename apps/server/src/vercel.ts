import 'reflect-metadata';

const { createVercelHandler } = await import('./bootstrap/vercel');
export default await createVercelHandler();
