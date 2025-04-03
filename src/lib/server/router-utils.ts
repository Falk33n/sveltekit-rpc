import { error, json, type RequestHandler } from '@sveltejs/kit';
import type { z, ZodSchema } from 'zod';
import type { routerBaseOutputSchema } from '../schemas';
import { appRouter, type AppRouter } from './app-router';

type RouteEvent = Parameters<RequestHandler>[0];

type ProcedureFunction<I, O> = (event: RouteEvent, input: I) => Promise<O> | O;

type MiddlewareFunction = (
	event: RouteEvent,
) => Promise<void | never> | (void | never);

type HttpMethod =
	| 'get'
	| 'post'
	| 'delete'
	| 'put'
	| 'patch'
	| 'options'
	| 'head';

function createProcedureMethods<
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

	const createMethodWithMiddlewares = <R>(
		fn: ProcedureFunction<Input, Output<R>>,
	) => {
		return async (event: RouteEvent, input: Input) => {
			const validatedInput = await validateInput(inputSchema, input);

			await applyMiddlewares(event);

			const result = await fn(event, validatedInput);

			if (outputSchema) {
				return await validateOutput(outputSchema, result as Output<O>);
			}

			return result;
		};
	};

	return {
		resolve: <R>(fn: ProcedureFunction<Input, Output<R>>) =>
			createMethodWithMiddlewares(fn),
	};
}

function createProcedureOutput<
	I extends ZodSchema,
	O extends ZodSchema,
	M extends MiddlewareFunction | undefined = undefined,
>(inputSchema: I, outputSchema: O, middlewares?: M[]) {
	return {
		...createProcedureMethods<I, O, M>(inputSchema, outputSchema, middlewares),
	};
}

function createProcedureInput<
	I extends ZodSchema,
	M extends MiddlewareFunction | undefined = undefined,
>(inputSchema: I, middlewares?: M[]) {
	return {
		...createProcedureMethods<I, undefined, M>(
			inputSchema,
			undefined,
			middlewares,
		),
		output: <O extends ZodSchema>(outputSchema: O) => {
			return createProcedureOutput<I, O, M>(
				inputSchema,
				outputSchema,
				middlewares,
			);
		},
	};
}

function createProcedure<M extends MiddlewareFunction | undefined = undefined>(
	middlewares?: M[],
) {
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

export function createAppRouter<
	T extends Record<string, ReturnType<typeof createRouter>>,
>(routers: T) {
	return routers;
}

function isValidEndpoint(router: any, endpoint: string): boolean {
	const parts = endpoint.split('/');
	let current: any = router;

	for (let i = 0; i < parts.length - 1; i++) {
		if (!(parts[i] in current)) return false;
		current = current[parts[i]];
	}

	return parts[parts.length - 1] in current;
}

type FlattenRouter<T> = {
	[K in Extract<keyof T, string | number>]: T[K] extends Record<string, any>
		? `${K}.${Extract<keyof T[K], string | number>}`
		: K;
}[Extract<keyof T, string | number>];

export type AppRouterEndpoints = FlattenRouter<AppRouter>;

type EndpointInput<E extends AppRouterEndpoints = AppRouterEndpoints> =
	E extends `${infer Route}.${infer Action}` // Break the string into Route and Action parts
		? Route extends keyof AppRouter // Ensure Route is a valid key of AppRouter
			? Action extends keyof AppRouter[Route] // Ensure Action is a valid key under that Route
				? Parameters<AppRouter[Route][Action]['handler']>[1] // Extract the input parameter type
				: never
			: never
		: never;

export async function callServerRouter(event: RouteEvent) {
	const endpoint = event.params.endpoints as AppRouterEndpoints | undefined;

	if (!endpoint || !isValidEndpoint(appRouter, endpoint)) {
		error(400, 'Bad endpoint request.');
	}

	const formattedEndpoint = endpoint.replace(/\//g, '.');

	const input = (await event.request.json()) as unknown;

	const response = await (
		appRouter[`${formattedEndpoint as never}.handler`] as ProcedureFunction<
			typeof input,
			z.infer<typeof routerBaseOutputSchema>
		>
	)(event, input);

	if (!response) {
		error(404, 'Endpoint not found.');
	}

	const { status, data, message } = response;

	if (status > 399) {
		error(status, message);
	}

	return json(data, { status, statusText: message });
}
