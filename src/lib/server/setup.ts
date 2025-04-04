import { error, type RequestHandler } from '@sveltejs/kit';
import type { z, ZodSchema } from 'zod';

export type RouteEvent = Parameters<RequestHandler>[0];

export type ProcedureFunction<I, O> = (event: RouteEvent, input: I) => Promise<O> | O;

type MiddlewareFunction = (event: RouteEvent) => Promise<void | never> | (void | never);

export type HttpMethod = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'options' | 'head';

function createProcedureHandler<
	I extends ZodSchema,
	O extends ZodSchema | undefined,
	M extends MiddlewareFunction | undefined = undefined,
>(inputSchema: I, outputSchema?: O, middlewares?: M[]) {
	type Input = z.infer<I>;
	type Output<R> = O extends ZodSchema ? z.infer<O> : R;

	const validateInput = async (schema: I, input: Input) => {
		const parsedInput = await schema.safeParseAsync(input);

		if (!parsedInput.success) {
			error(400, 'Bad input request.');
		}

		return parsedInput.data as Input;
	};

	const validateOutput = async (schema: O, output: Output<O>) => {
		if (!schema) {
			error(400, 'Bad output request.');
		}

		const parsedOutput = await schema.safeParseAsync(output);

		if (!parsedOutput.success) {
			error(400, 'Bad output request.');
		}

		return parsedOutput.data as Output<O>;
	};

	const applyMiddlewares = async (event: RouteEvent) => {
		if (middlewares && middlewares.length > 0) {
			for (const middleware of middlewares) {
				await middleware?.(event);
			}
		}
	};

	const createHandlerWithMiddlewares = <R>(fn: ProcedureFunction<Input, Output<R>>) => {
		return async (event: RouteEvent, input: Input) => {
			const validatedInput = await validateInput(inputSchema, input);

			await applyMiddlewares(event);

			const result = await fn(event, validatedInput);

			if (result.status < 100 || result.status > 599) {
				error(400, 'Invalid Http status code.');
			}

			if (outputSchema) {
				return await validateOutput(outputSchema, result as Output<O>);
			}

			return result;
		};
	};

	return {
		resolve: <R>(fn: ProcedureFunction<Input, Output<R>>) => createHandlerWithMiddlewares(fn),
	};
}

function createProcedureOutput<
	I extends ZodSchema,
	O extends ZodSchema,
	M extends MiddlewareFunction | undefined = undefined,
>(inputSchema: I, outputSchema: O, middlewares?: M[]) {
	return {
		...createProcedureHandler<I, O, M>(inputSchema, outputSchema, middlewares),
	};
}

function createProcedureInput<
	I extends ZodSchema,
	M extends MiddlewareFunction | undefined = undefined,
>(inputSchema: I, middlewares?: M[]) {
	return {
		...createProcedureHandler<I, undefined, M>(inputSchema, undefined, middlewares),
		output: <O extends ZodSchema>(outputSchema: O) => {
			return createProcedureOutput<I, O, M>(inputSchema, outputSchema, middlewares);
		},
	};
}

function createProcedure<M extends MiddlewareFunction | undefined = undefined>(middlewares?: M[]) {
	return {
		input: <I extends ZodSchema>(inputSchema: I) => {
			return createProcedureInput<I, M>(inputSchema, middlewares);
		},
		use: (fn: MiddlewareFunction) => {
			return createProcedure(middlewares ? [...middlewares, fn] : [fn]);
		},
	};
}

export const publicProcedure = createProcedure();

type ZodInferSchema = z.infer<ZodSchema>;

type Route = {
	method: HttpMethod;
	handler: ProcedureFunction<ZodInferSchema, ZodInferSchema>;
};

export function createRouter<T extends Record<string, Route>>(routes: T) {
	return routes;
}

export function createAppRouter<T extends Record<string, ReturnType<typeof createRouter>>>(
	routers: T,
) {
	return routers;
}
