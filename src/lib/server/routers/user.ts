import {
	userGetPayloadSchema,
	userGetReturnSchema,
	type UserGetPayload,
	type UserGetReturnType,
} from '$schemas';
import type { Router } from '$server/types';

export const userRouter = {
	getUnique: {
		get: async (event, payload: UserGetPayload): UserGetReturnType => {
			return { status: 200, data: { id: '123', name: 'Billy' } };
		},
	},
	getAll: {
		get: async (event, payload: UserGetPayload): UserGetReturnType => {
			return { status: 200, data: { id: '223', name: 'Hanna' } };
		},
	},
} satisfies Router;

export const userValidation = {
	getUnique: {
		get: {
			payloadSchema: userGetPayloadSchema,
			returnSchema: userGetReturnSchema,
		},
	},
	getAll: {
		get: {
			payloadSchema: userGetPayloadSchema,
			returnSchema: userGetReturnSchema,
		},
	},
};
