import { error, json } from '@sveltejs/kit';
import type { z } from 'zod';
import type { routerBaseOutputSchema } from '../schemas';
import { appRouter, type AppRouter } from './root';
import type { ProcedureFunction, RouteEvent } from './setup';

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

export async function callRouter(event: RouteEvent) {
	const endpoints = event.params.endpoints;

	if (!endpoints || !isValidEndpoint(appRouter, endpoints)) {
		error(400, 'Bad endpoint request.');
	}

	const [route, endpoint] = endpoints.split('/');

	const input = (await event.request.json()) as unknown;

	const response = await (
		appRouter[route as never][endpoint]['handler'] as ProcedureFunction<
			typeof input,
			z.infer<typeof routerBaseOutputSchema>
		>
	)(event, input);

	if (!response) {
		error(404, 'Endpoint not found.');
	}

	if (response.status > 399) {
		error(response.status, response.message);
	}

	return json(response, { status: response.status, statusText: response.message });
}
