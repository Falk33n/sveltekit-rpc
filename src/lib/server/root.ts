import {
	authRouter,
	authValidation,
	userRouter,
	userValidation,
} from '$server/routers';
import type { RootRouter } from '$server/types';

export const rootRouter = {
	user: userRouter,
	auth: authRouter,
} satisfies RootRouter;

export const rootValidation = {
	user: userValidation,
	auth: authValidation,
};
