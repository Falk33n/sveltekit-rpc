import { callCorrectEndpoint } from '$server/utils';
import { text, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	return callCorrectEndpoint(event);
};

export const POST: RequestHandler = async (event) => {
	return callCorrectEndpoint(event);
};

export const DELETE: RequestHandler = async (event) => {
	return callCorrectEndpoint(event);
};

export const PUT: RequestHandler = async (event) => {
	return callCorrectEndpoint(event);
};

export const PATCH: RequestHandler = async (event) => {
	return callCorrectEndpoint(event);
};

export const OPTIONS: RequestHandler = async (event) => {
	return callCorrectEndpoint(event);
};

export const HEAD: RequestHandler = async (event) => {
	return callCorrectEndpoint(event);
};

export const fallback: RequestHandler = async ({ request }) => {
	return text(`No ${request.method} method was found.`);
};
