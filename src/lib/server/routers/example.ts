import { exampleInputSchema, exampleOutputSchema } from '$lib/schemas/example';
import { createRouter, publicProcedure } from '../setup';

const exampleProcedure = publicProcedure.use(() => console.log('example'));

export const exampleRouter = createRouter({
	example: {
		method: 'post',
		handler: exampleProcedure
			.input(exampleInputSchema)
			.output(exampleOutputSchema)
			.resolve(async (event, input) => {
				const { id } = input;

				console.log(event.params);

				return {
					status: 200,
					data: { id, name: 'hanna' },
					message: 'OK',
				};
			}),
	},
});
