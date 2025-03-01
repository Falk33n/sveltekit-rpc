import { routerBaseOutputSchema } from '$schemas';
import type { rootRouter } from '$server/root';
import type { RequestHandler } from '@sveltejs/kit';
import type { z } from 'zod';

type EndpointTypes = typeof rootRouter;

export type RouterEvent = Parameters<RequestHandler>[0];

type RouterOutput = z.infer<typeof routerBaseOutputSchema>;

export type HttpMethod =
	| 'get'
	| 'post'
	| 'delete'
	| 'put'
	| 'patch'
	| 'options'
	| 'head';

export type OutputSchema<T extends z.ZodTypeAny> = z.ZodObject<
	typeof routerBaseOutputSchema.shape & T['_def']['shape']
>;

export type RouterFunction = (
	event: RouterEvent,
	input: any,
) => Promise<unknown>;

export type Router = Record<
	string,
	Record<'inputSchema', z.ZodSchema<any>> &
		Record<'outputSchema', OutputSchema<any>> &
		Partial<Record<HttpMethod, RouterFunction>>
>;

export type RootRouter = Record<string, Router>;

export type EndpointRouters = keyof EndpointTypes;

export type RouterEndpoints = {
	[K in EndpointRouters]: `${K}/${Extract<keyof EndpointTypes[K], string>}`;
}[EndpointRouters];

export type RouterOutputType<T extends RouterEndpoints> =
	T extends `${infer Router}/${infer Endpoint}`
		? Router extends EndpointRouters
			? Endpoint extends keyof EndpointTypes[Router]
				? EndpointTypes[Router][Endpoint] extends (
						event: RouterEvent,
						input: any,
					) => Promise<infer O>
					? O
					: never
				: never
			: never
		: never;

export type RouterInputType<T extends RouterEndpoints> =
	T extends `${infer Router}/${infer Endpoint}`
		? Router extends EndpointRouters
			? Endpoint extends keyof EndpointTypes[Router]
				? EndpointTypes[Router][Endpoint] extends (
						event: RouterEvent,
						input: infer I,
					) => Promise<RouterOutput>
					? I
					: never
				: never
			: never
		: never;
