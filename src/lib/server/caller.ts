import { error, json } from '@sveltejs/kit';
import type { z } from 'zod';
import type { routerBaseOutputSchema } from '../schemas';
import { appRouter } from './root';
import type { ProcedureFunction, RouteEvent } from './setup';

/** Function that validates if the given `endpoint` exists in the given `router`. */
function isValidEndpoint(router: unknown, endpoint: string) {
	const parts = endpoint.split('/');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let current: any = router;

	for (let i = 0; i < parts.length - 1; i++) {
		if (!(parts[i] in current)) return false;
		current = current[parts[i]];
	}

	return parts[parts.length - 1] in current;
}

/**
 * Function that executes the correct endpoint from the given `event.params.endpoints` slug.
 * This is the function that gets called in each `SvelteKit` `+server.ts` endpoint.
 */
export async function callRouter(event: RouteEvent) {
	const endpoints = event.params.endpoints;

	if (!endpoints || !isValidEndpoint(appRouter, endpoints)) {
		error(400, 'Bad endpoint request.');
	}

	const [route, endpoint] = endpoints.split('/');

	const input = (await event.request.json()) as unknown;

	// Calls the correct endpoint of the appRouter.
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
