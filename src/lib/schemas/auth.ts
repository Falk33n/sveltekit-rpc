import { routerReturnSchema } from '$schemas';
import { z } from 'zod';

export const authenticatePayloadSchema = z.object({
	email: z
		.string({
			required_error: 'Email is required.',
			invalid_type_error: 'Email must be a string.',
		})
		.nonempty('Email can not be empty.')
		.email('Email must be of a valid email format.'),
});

export type AuthenticatePayload = z.infer<typeof authenticatePayloadSchema>;

export const authenticateReturnSchema = routerReturnSchema.extend({
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

export type AuthenticateReturnType = Promise<
	z.infer<typeof authenticateReturnSchema>
>;
