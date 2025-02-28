import { rootRouter } from '$server/root';
import type {
	EndpointRouters,
	HttpMethod,
	RouterEndpoints,
	RouterEvent,
	RouterFunction,
} from '$server/types';
import { error, json } from '@sveltejs/kit';

export const callCorrectEndpoint = async (event: RouterEvent) => {
	const path = event.url.searchParams.get('endpoint') as RouterEndpoints | null;

	if (!path) {
		error(400, 'The correct search parameter was not given.');
	}

	const payload = (await event.request.json()) as unknown;
	const method = event.request.method.toLowerCase() as HttpMethod;

	const [routerName, routerFunction] = path.split('/') as [
		EndpointRouters | '',
		string,
	];

	if (routerName === '' || !(routerName in rootRouter)) {
		error(404, 'The endpoint was not found.');
	}

	const callFunction = rootRouter[routerName][routerFunction as never][
		method
	] as RouterFunction | undefined;

	if (!callFunction) {
		error(404, 'The endpoint was not found.');
	}

	const { status, message, data } = await callFunction(event, payload);

	if (status > 399) {
		error(status, message);
	}

	return json(data, { status, statusText: message });
};
