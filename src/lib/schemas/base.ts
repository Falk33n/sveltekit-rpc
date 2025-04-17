import { z } from 'zod';

/** The base output schema of each endpoint. */
export const routerBaseOutputSchema = z.object({
	status: z
		.number({
			required_error: 'Status is required.',
			invalid_type_error: 'Status must be an integer.',
		})
		.int('Status must be an integer.')
		.min(100, 'Status must be greater than or equal to 100.')
		.max(599, 'Status must be lesser than or equal to 599.'),
	data: z.any().optional(),
	message: z
		.string({ invalid_type_error: 'Message must be a string.' })
		.nonempty('Message can not be empty.')
		.optional(),
});
