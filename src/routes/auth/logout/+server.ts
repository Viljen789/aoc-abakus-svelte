import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSession } from '$lib/server/session';

export const POST: RequestHandler = async ({ cookies }) => {
	deleteSession(cookies);

	throw redirect(302, '/');
};
