import { userGetInputSchema, userGetOutputSchema } from '$lib/schemas';
import { createRouter, publicProcedure } from '../router-utils';

export const authRouter = createRouter({
	authenticate: {
		method: 'get',
		handler: publicProcedure
			.input(userGetInputSchema)
			.output(userGetOutputSchema)
			.resolve(async (event, input) => {
				return {
					status: 200,
					data: { id: '123', name: 'hanna' },
					message: 'OK',
				};
			}),
	},
});
