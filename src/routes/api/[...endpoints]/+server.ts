import { callRouter } from '$lib/server/caller';
import { text, type RequestHandler } from '@sveltejs/kit';

// Only export the methods that is actually available in your app router.

export const POST: RequestHandler = async (event) => {
	return await callRouter(event);
};

/*
export const GET: RequestHandler = async (event) => {
	return await callRouter(event);
};

export const DELETE: RequestHandler = async (event) => {
	return await callRouter(event);
};

export const PUT: RequestHandler = async (event) => {
	return await callRouter(event);
};

export const PATCH: RequestHandler = async (event) => {
	return await callRouter(event);
};

export const OPTIONS: RequestHandler = async (event) => {
	return await callRouter(event);
};

export const HEAD: RequestHandler = async (event) => {
	return await callRouter(event);
}; 
*/

export const fallback: RequestHandler = async ({ request }) => {
	return text(`No ${request.method} method was found.`);
};
