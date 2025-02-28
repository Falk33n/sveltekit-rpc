import {
	authenticatePayloadSchema,
	authenticateReturnSchema,
	type AuthenticatePayload,
	type AuthenticateReturnType,
} from '$schemas';
import type { Router } from '$server/types';

export const authRouter = {
	authenticate: {
		post: async (
			event,
			payload: AuthenticatePayload,
		): AuthenticateReturnType => {
			return { status: 200, data: { authenticated: true } };
		},
	},
} satisfies Router;

export const authValidation = {
	authenticate: {
		post: {
			payloadSchema: authenticatePayloadSchema,
			returnSchema: authenticateReturnSchema,
		},
	},
};
