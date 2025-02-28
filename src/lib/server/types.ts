import type { rootRouter } from '$server/root';
import type { RequestHandler } from '@sveltejs/kit';

type EndpointTypes = typeof rootRouter;

export type RouterEvent = Parameters<RequestHandler>[0];

type RouterReturnObject = { status: number; message?: string; data?: any };

export type HttpMethod =
	| 'get'
	| 'post'
	| 'delete'
	| 'put'
	| 'patch'
	| 'options'
	| 'head';

export type RouterFunction = (
	event: RouterEvent,
	payload: any,
) => Promise<RouterReturnObject>;

export type Router = Record<
	string,
	Partial<Record<HttpMethod, RouterFunction>>
>;

export type RootRouter = Record<string, Router>;

export type EndpointRouters = keyof EndpointTypes;

export type RouterEndpoints = {
	[K in EndpointRouters]: `${K}/${Extract<keyof EndpointTypes[K], string>}`;
}[EndpointRouters];

export type RouterReturnType<T extends RouterEndpoints> =
	T extends `${infer Router}/${infer Endpoint}`
		? Router extends EndpointRouters
			? Endpoint extends keyof EndpointTypes[Router]
				? EndpointTypes[Router][Endpoint] extends (
						event: RouterEvent,
						payload: any,
					) => Promise<infer R>
					? R
					: never
				: never
			: never
		: never;

export type RouterPayload<T extends RouterEndpoints> =
	T extends `${infer Router}/${infer Endpoint}`
		? Router extends EndpointRouters
			? Endpoint extends keyof EndpointTypes[Router]
				? EndpointTypes[Router][Endpoint] extends (
						event: RouterEvent,
						payload: infer P,
					) => Promise<RouterReturnObject>
					? P
					: never
				: never
			: never
		: never;
