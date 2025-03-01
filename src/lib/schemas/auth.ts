import { routerBaseOutputSchema } from '$schemas';
import { z } from 'zod';

export const authenticateInputSchema = z.object({
	email: z
		.string({
			required_error: 'Email is required.',
			invalid_type_error: 'Email must be a string.',
		})
		.nonempty('Email can not be empty.')
		.email('Email must be of a valid email format.'),
});

export const authenticateOutputSchema = routerBaseOutputSchema.extend({
	data: z
		.object({
			authenticated: z
				.boolean({
					required_error: 'Authenticate is required.',
					invalid_type_error: 'Authenticate must be an boolean.',
				})
				.default(false),
		})
		.optional(),
});
