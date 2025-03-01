import { userGetInputSchema, userGetOutputSchema } from '$schemas';
import type { Router } from '$server/types';

export const userRouter = {
	getUnique: {
		inputSchema: userGetInputSchema,
		outputSchema: userGetOutputSchema,
		get: async (event, input) => {
			return { status: 200, data: { id: '123', name: 'Billy' } };
		},
	},
	getAll: {
		inputSchema: userGetInputSchema,
		outputSchema: userGetOutputSchema,
		get: async (event, input) => {
			return { status: 200, data: { id: '223', name: 'Hanna' } };
		},
	},
} satisfies Router;
