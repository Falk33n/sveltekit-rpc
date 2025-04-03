import { createAppRouter } from './router-utils';
import { authRouter, userRouter } from './routers';

export const appRouter = createAppRouter({
	user: userRouter,
	auth: authRouter,
});

export type AppRouter = typeof appRouter;
