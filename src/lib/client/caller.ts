import { toast } from 'svelte-sonner';
import type { z } from 'zod';
import type { routerBaseOutputSchema } from '../schemas';
import type { AppRouterEndpoints } from '../server/caller';
import type { AppRouter } from '../server/root';
import type { HttpMethod } from '../server/setup';

type ResolvePath<T, P extends string> = P extends `${infer K}.${infer Rest}`
	? K extends keyof T
		? ResolvePath<T[K], Rest>
		: never
	: P extends keyof T
		? T[P]
		: never;

export type ExtractMethod<T, P extends string> =
	ResolvePath<T, P> extends { method: infer M } ? M : never;

export type ExtractInput<T, P extends string> =
	ResolvePath<T, P> extends { handler: (...args: infer Params) => any } ? Params[1] : never;

export type ExtractOutput<T, P extends string> =
	ResolvePath<T, P> extends { handler: (...args: any) => infer R } ? R : never;

type RequestOptions = Omit<RequestInfo, 'body' | 'method'>;

type ClientCallerInput<T extends AppRouterEndpoints> = {
	method: ExtractMethod<AppRouter, T>;
	input: ExtractInput<AppRouter, T>;
	requestOptions?: RequestOptions;
};

type ClientCallerOutput<T extends AppRouterEndpoints> = Promise<
	ExtractOutput<AppRouter, T> | z.infer<typeof routerBaseOutputSchema> | undefined
>;

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
