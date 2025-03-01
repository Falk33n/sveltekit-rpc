import { authRouter, userRouter } from '$server/routers';
import type { RootRouter } from '$server/types';

export const rootRouter = {
	user: userRouter,
	auth: authRouter,
} satisfies RootRouter;
