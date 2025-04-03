import type { AppRouterEndpoints } from '../server/router-utils';

export function callClientRouter<E = AppRouterEndpoints>(
	endpoint: E,
	input: Parameters<E['handler']>,
) {}

/* export async function callApi<
	T extends AppRouterEndpoints, 
	M extends RouterMethods<T>
>(
	endpoint: `${T}/${M}`,
	input: RouterInput<T, M>
): Promise<RouterOutput<T, M>> {
	const [router, method] = endpoint.split('/') as [T, M];

	const response = await fetch(`/api/${router}/${method}`, {
		method: 'POST', // Assuming we're sending data via POST
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});

	if (!response.ok) {
		throw new Error(`API Error: ${response.statusText}`);
	}

	return (await response.json()) as RouterOutput<T, M>;
} */
