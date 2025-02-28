import { routerReturnSchema } from '$schemas';
import { z } from 'zod';

export const userGetPayloadSchema = z.object({
	id: z
		.string({
			required_error: 'ID is required.',
			invalid_type_error: 'ID must be a string.',
		})
		.nonempty('ID can not be empty.'),
});

export type UserGetPayload = z.infer<typeof userGetPayloadSchema>;

export const userGetReturnSchema = routerReturnSchema.extend({
	data: z
		.object({
			id: z
				.string({
					required_error: 'ID is required.',
					invalid_type_error: 'ID must be a string.',
				})
				.nonempty('ID can not be empty.'),
			name: z
				.string({
					required_error: 'Name is required.',
					invalid_type_error: 'Name must be a string.',
				})
				.nonempty('Name can not be empty.'),
		})
		.optional(),
});

export type UserGetReturnType = Promise<z.infer<typeof userGetReturnSchema>>;
