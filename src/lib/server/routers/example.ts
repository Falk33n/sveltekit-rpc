import { exampleInputSchema, exampleOutputSchema } from '$lib/schemas/example';
import { createRouter, publicProcedure } from '../setup';

// This is how we define an middleware to be used and called inbefore each endpoint runs.
const exampleProcedure = publicProcedure.use((event) => console.log(event.cookies.getAll()));

export const exampleRouter = createRouter({
	example: {
		method: 'post',
		handler: exampleProcedure
			.input(exampleInputSchema)
			.output(exampleOutputSchema)
			.resolve(async (event, input) => {
				// The input is directly parsed from the input schema.
				const { id } = input;

				// The event is the same as the event that comes from SvelteKit backend.
				console.log(event.params);

				// The output is directly parsed from the output schema.
				return {
					status: 200,
					data: { id, name: 'hanna' },
					message: 'OK',
				};
			}),
	},
});
