import { userGetInputSchema, userGetOutputSchema } from '$schemas';
import type { RequestHandler } from '@sveltejs/kit';
import type { z, ZodSchema } from 'zod';

type RouteEvent = Parameters<RequestHandler>[0];

type ProcedureFunction<I, O> = (event: RouteEvent, input: I) => Promise<O> | O;

type MiddlewareFunction = (
	event: RouteEvent,
) => Promise<void | never> | (void | never);

export function createMiddleware(fn: MiddlewareFunction) {
	return fn;
}

function createProcedureMethods<
	I extends ZodSchema,
	O extends ZodSchema | undefined,
	M extends MiddlewareFunction | undefined = undefined,
>(middlewares?: M[]) {
	type Input = z.infer<I>;
	type Output<R> = O extends ZodSchema ? z.infer<O> : R;

	const applyMiddlewares = async (event: RouteEvent) => {
		if (middlewares && middlewares.length > 0) {
			for (const middleware of middlewares) {
				await middleware?.(event);
			}
		}
	};

	const createMethodWithMiddlewares = <R>(
		fn: ProcedureFunction<Input, Output<R>>,
	) => {
		return async (event: RouteEvent, input: Input) => {
			await applyMiddlewares(event);
			return fn(event, input);
		};
	};

	return {
		get: <R>(fn: ProcedureFunction<Input, Output<R>>) => {
			return createMethodWithMiddlewares(fn);
		},
		post: <R>(fn: ProcedureFunction<Input, Output<R>>) => {
			return createMethodWithMiddlewares(fn);
		},
		delete: <R>(fn: ProcedureFunction<Input, Output<R>>) => {
			return createMethodWithMiddlewares(fn);
		},
		put: <R>(fn: ProcedureFunction<Input, Output<R>>) => {
			return createMethodWithMiddlewares(fn);
		},
		patch: <R>(fn: ProcedureFunction<Input, Output<R>>) => {
			return createMethodWithMiddlewares(fn);
		},
		options: <R>(fn: ProcedureFunction<Input, Output<R>>) => {
			return createMethodWithMiddlewares(fn);
		},
		head: <R>(fn: ProcedureFunction<Input, Output<R>>) => {
			return createMethodWithMiddlewares(fn);
		},
	};
}

function createProcedureOutput<
	I extends ZodSchema,
	O extends ZodSchema,
	M extends MiddlewareFunction | undefined = undefined,
>(middlewares?: M[]) {
	return {
		...createProcedureMethods<I, O, M>(middlewares),
	};
}

function createProcedureInput<
	I extends ZodSchema,
	M extends MiddlewareFunction | undefined = undefined,
>(middlewares?: M[]) {
	return {
		...createProcedureMethods<I, undefined>(),
		output: <O extends ZodSchema>(_output: O) => {
			return createProcedureOutput<I, O, M>(middlewares);
		},
	};
}

function createProcedure<M extends MiddlewareFunction | undefined = undefined>(
	middlewares?: M[],
) {
	return {
		input: <I extends ZodSchema>(_input: I) => {
			return createProcedureInput<I, M>(middlewares);
		},
		use: (fn: MiddlewareFunction) => {
			return createProcedure(middlewares ? [...middlewares, fn] : [fn]);
		},
	};
}

export const publicProcedure = createProcedure();

type ZodInferSchema = z.infer<ZodSchema>;

export function createRouter<
	T extends Record<string, ProcedureFunction<ZodInferSchema, ZodInferSchema>>,
>(routes: T) {
	return routes;
}

export function createAppRouter<
	T extends Record<string, ReturnType<typeof createRouter>>,
>(routers: T) {
	return routers;
}

export const userRouter = createRouter({
	getAll: publicProcedure
		.input(userGetInputSchema)
		.output(userGetOutputSchema)
		.get(async (event, input) => {
			return { status: 200, data: { id: '123', name: 'hanna' }, message: 'OK' };
		}),
});

export const authRouter = createRouter({
	authenticate: publicProcedure
		.input(userGetInputSchema)
		.output(userGetOutputSchema)
		.get(async (event, input) => {
			return { status: 200, data: { id: '123', name: 'hanna' }, message: 'OK' };
		}),
});

const appRouter = createAppRouter({
	user: userRouter,
	auth: authRouter,
});

export type AppRouter = typeof appRouter;
