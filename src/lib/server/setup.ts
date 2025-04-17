import { error, type RequestHandler } from '@sveltejs/kit';
import type { z, ZodSchema } from 'zod';
import type { appRouter } from './root';

/** The `typeof appRouter` used to get `IntelliSense` in the frontend `callApi` function. */
export type AppRouter = typeof appRouter;

/** The type of the `event` parameter in `SvelteKit` `API` events. */
export type RouteEvent = Parameters<RequestHandler>[0];

/**
 * The functions used in the endpoints. Takes an `SvelteKit` `event` and an generic `input`
 * and returns the generic `output`.
 */
export type ProcedureFunction<I, O> = (event: RouteEvent, input: I) => Promise<O> | O;

/** The functions used in middlewares, takes an `SvelteKit` `event` and returns `void` or `throws`. */
type MiddlewareFunction = (event: RouteEvent) => Promise<void | never> | (void | never);

/** The available `SvelteKit` `HTTP` methods. */
export type HttpMethod = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'options' | 'head';

/** Optional type that extends the `MiddlewareFunction` with `undefined` value. */
type OptionalMiddlewareFunction = MiddlewareFunction | undefined;

/**
 * The root function that is responsible for executing both the endpoint function but also
 * handling middlewares and validation.
 */
function createProcedureHandler<
	I extends ZodSchema,
	O extends ZodSchema | undefined,
	M extends OptionalMiddlewareFunction = undefined,
>(inputSchema: I, outputSchema?: O, middlewares?: M[]) {
	type Input = z.infer<I>;
	type Output<R> = O extends ZodSchema ? z.infer<O> : R;

	/**
	 * Validates and returns the `input` depending on the `input schema`.
	 * Could throw if `input` does not match the schema.
	 */
	const validateInput = async (schema: I, input: Input) => {
		const parsedInput = await schema.safeParseAsync(input);

		if (!parsedInput.success) {
			error(400, 'Bad input request.');
		}

		return parsedInput.data as Input;
	};

	/**
	 * Validates and returns the `output` depending on the `output schema`.
	 * Could throw if `output` does not match the schema.
	 */
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

	/** Function responsible for executing each possible middleware that exists in the procedure. */
	const applyMiddlewares = async (event: RouteEvent) => {
		if (middlewares && middlewares.length > 0) {
			for (const middleware of middlewares) {
				await middleware?.(event);
			}
		}
	};

	/**
	 * The function that is responsible for returning both the endpoint function but also
	 * handling middlewares and validation before reaching the final endpoint.
	 */
	const createHandlerWithMiddlewares = <R>(fn: ProcedureFunction<Input, Output<R>>) => {
		return async (event: RouteEvent, input: Input) => {
			const validatedInput = await validateInput(inputSchema, input);

			await applyMiddlewares(event);

			const result = await fn(event, validatedInput);

			if (result.status < 100 || result.status > 599) {
				error(400, 'Invalid Http status code.');
			}

			if (!outputSchema) return result;

			return await validateOutput(outputSchema, result as Output<O>);
		};
	};

	return {
		resolve: <R>(fn: ProcedureFunction<Input, Output<R>>) => createHandlerWithMiddlewares(fn),
	};
}

/** Function responsible for returning the `endpoint function` to the user. */
function createProcedureOutput<
	I extends ZodSchema,
	O extends ZodSchema,
	M extends OptionalMiddlewareFunction = undefined,
>(inputSchema: I, outputSchema: O, middlewares?: M[]) {
	return {
		...createProcedureHandler<I, O, M>(inputSchema, outputSchema, middlewares),
	};
}

/** Function responsible for returning the `endpoint function` to the user but also an optional `output`. */
function createProcedureInput<
	I extends ZodSchema,
	M extends OptionalMiddlewareFunction = undefined,
>(inputSchema: I, middlewares?: M[]) {
	return {
		...createProcedureHandler<I, undefined, M>(inputSchema, undefined, middlewares),
		output: <O extends ZodSchema>(outputSchema: O) => {
			return createProcedureOutput<I, O, M>(inputSchema, outputSchema, middlewares);
		},
	};
}

/** Function responsible for returning the `input` to the user but also an optional middleware (`use`). */
function createProcedure<M extends OptionalMiddlewareFunction = undefined>(middlewares?: M[]) {
	return {
		input: <I extends ZodSchema>(inputSchema: I) => {
			return createProcedureInput<I, M>(inputSchema, middlewares);
		},
		use: (fn: MiddlewareFunction) => {
			return createProcedure(middlewares ? [...middlewares, fn] : [fn]);
		},
	};
}

/**
 * The base `middleware` that can get further built on. This holds `input` and `output` validation
 * but also execution of the `endpoint function`.
 */
export const publicProcedure = createProcedure();

/** Reusable type for `Zod` inferring any `ZodSchema` */
type ZodInferSchema = z.infer<ZodSchema>;

/** The properties of each endpoint. Contains what `method` to use but also the `endpoint function` */
type Route = {
	/** The `HTTP` method to be used. */
	method: HttpMethod;

	/** The `handler` is what takes the `input` and optional `output` before returning the `endpoint function` */
	handler: ProcedureFunction<ZodInferSchema, ZodInferSchema>;
};

/** Function responsible for creating an base router that holds a category of endpoints. */
export function createRouter<T extends Record<string, Route>>(routes: T) {
	return routes;
}

/** The return type of the `createRouter` function. */
type CreateRouterReturnType = ReturnType<typeof createRouter>;

/** Function responsible for creating the app router that holds all categorized routers. */
export function createAppRouter<T extends Record<string, CreateRouterReturnType>>(routers: T) {
	return routers;
}
