import { toast } from 'svelte-sonner';
import type { z } from 'zod';
import type { routerBaseOutputSchema } from '../schemas';
import type { AppRouter, HttpMethod } from '../server/setup';

/** Resolves a nested path string (e.g., "users.get") to the corresponding type within a nested object. */
type ResolvePath<T, P extends string> = P extends `${infer K}.${infer Rest}`
	? K extends keyof T
		? ResolvePath<T[K], Rest>
		: never
	: P extends keyof T
		? T[P]
		: never;

/** Extracts the `HTTP` method from a router endpoint. */
type ExtractMethod<T, P extends string> = ResolvePath<T, P> extends { method: infer M } ? M : never;

/** Extracts the `input` from a router endpoint. */
type ExtractInput<T, P extends string> =
	ResolvePath<T, P> extends { handler: (...args: infer Params) => unknown } ? Params[1] : never;

/** Extracts the `output` from a router endpoint. */
type ExtractOutput<T, P extends string> =
	ResolvePath<T, P> extends { handler: (...args: unknown[]) => infer R } ? R : never;

/**
 * Optional request configuration excluding the body and method,
 * which are controlled internally in the `callApi` function.
 */
type RequestOptions = Omit<RequestInfo, 'body' | 'method'>;

/** Input arguments for calling an API endpoint through the `callApi` function. */
type ClientCallerInput<T extends AppRouterEndpoints> = {
	/**
	 * The HTTP method to use for the request (e.g., "GET", "POST", "PATCH").
	 * Inferred from the backend endpoint's `method` property.
	 */
	method: ExtractMethod<AppRouter, T>;

	/**
	 * The payload/body to send with the request.
	 * Inferred from the second parameter of the backend endpoint's `handler` function.
	 */
	input: ExtractInput<AppRouter, T>;

	/**
	 * Optional configuration for the fetch request, excluding `body` and `method` which are handled internally.
	 */
	requestOptions?: RequestOptions;
};

/**
 * Output type of the `callApi` function. It either returns the defined endpoint output,
 * a base error schema, or undefined if the request fails unexpectedly.
 */
type ClientCallerOutput<T extends AppRouterEndpoints> = Promise<
	ExtractOutput<AppRouter, T> | z.infer<typeof routerBaseOutputSchema> | undefined
>;

/** Flattens the `router object` to become a string containing each `endpoint` path seperated by a `"."` */
type FlattenRouter<T> = {
	[K in Extract<keyof T, string | number>]: T[K] extends Record<string, unknown>
		? `${K}.${Extract<keyof T[K], string | number>}`
		: K;
}[Extract<keyof T, string | number>];

/** All the defined flattened `AppRouter` endpoints. */
type AppRouterEndpoints = FlattenRouter<AppRouter>;

/**
 * Function responsible for calling the backend router endpoints from the client.
 * This is the only client function that has a relationship to the backend.
 */
export async function callApi<T extends AppRouterEndpoints>(
	endpoint: T,
	{ method, input, requestOptions }: ClientCallerInput<T>,
): ClientCallerOutput<T> {
	const formattedEndpoint = endpoint.replace(/\./g, '/');

	const response = await fetch(`api/${formattedEndpoint}`, {
		body: JSON.stringify(input),
		method: method as HttpMethod,
		...requestOptions,
	});

	if (!response.ok) {
		toast.error('The request failed!', {
			description: response.statusText,
		});

		return;
	}

	try {
		const output = (await response.json()) as ExtractOutput<AppRouter, T>;
		return output;
	} catch {
		return { status: 404, message: await response.text() };
	}
}
