import type { Handle } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	const session = getSession(event.cookies);

	if (session) {
		event.locals.user = session.user;
		event.locals.accessToken = session.accessToken;
	}

	return resolve(event);
};
