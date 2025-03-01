import { authenticateInputSchema, authenticateOutputSchema } from '$schemas';
import type { Router } from '$server/types';

export const authRouter = {
	authenticate: {
		inputSchema: authenticateInputSchema,
		outputSchema: authenticateOutputSchema,
		post: async (event, input) => {
			return { status: 200, data: { authenticated: true } };
		},
	},
} satisfies Router;
