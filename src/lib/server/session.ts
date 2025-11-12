import type { Cookies } from '@sveltejs/kit';
import { SESSION_SECRET } from '$env/static/private';
import type { AbakusUser } from './auth';

const SESSION_COOKIE_NAME = 'abakus_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// In-memory session store for local dev, using db for prod
const sessions = new Map<
	string,
	{
		user: AbakusUser;
		accessToken: string;
		expiresAt: number;
	}
>();

function createSessionId(): string {
	return (
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15) +
		Date.now().toString(36)
	);
}

export function createSession(
	cookies: Cookies,
	user: AbakusUser,
	accessToken: string,
	expiresIn: number
): string {
	const sessionId = createSessionId();
	const expiresAt = Date.now() + expiresIn * 1000;

	sessions.set(sessionId, {
		user,
		accessToken,
		expiresAt
	});

	cookies.set(SESSION_COOKIE_NAME, sessionId, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: SESSION_MAX_AGE
	});

	return sessionId;
}

export function getSession(cookies: Cookies): {
	user: AbakusUser;
	accessToken: string;
} | null {
	const sessionId = cookies.get(SESSION_COOKIE_NAME);

	if (!sessionId) {
		return null;
	}

	const session = sessions.get(sessionId);

	if (!session) {
		return null;
	}

	// Check if session has expired
	if (session.expiresAt < Date.now()) {
		sessions.delete(sessionId);
		cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
		return null;
	}

	return {
		user: session.user,
		accessToken: session.accessToken
	};
}

export function deleteSession(cookies: Cookies): void {
	const sessionId = cookies.get(SESSION_COOKIE_NAME);

	if (sessionId) {
		sessions.delete(sessionId);
		cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	}
}
