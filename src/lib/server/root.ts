import { exampleRouter } from './routers';
import { createAppRouter } from './setup';

export const appRouter = createAppRouter({
	example: exampleRouter,
});

export type AppRouter = typeof appRouter;
