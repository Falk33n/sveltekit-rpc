import { exampleRouter } from './routers';
import { createAppRouter } from './setup';

/**
 * The root router of the application. This is where you define and structure
 * all your categorized routers.
 */
export const appRouter = createAppRouter({
	example: exampleRouter,
});
