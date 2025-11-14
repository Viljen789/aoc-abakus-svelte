import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exchangeCodeForToken, fetchUserData } from '$lib/server/auth';
import { createSession } from '$lib/server/session';

export const GET: RequestHandler = async ({ url, cookies }) => {
	//Debugging

	/*console.log('=== OAuth Callback ===');
	console.log('All cookies:', cookies.getAll());
	console.log('Received state from URL:', url.searchParams.get('state'));
	console.log('Stored state from cookie:', cookies.get('oauth_state'));
	console.log('======================');*/

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('oauth_state');
	// Prevent CSRF attack
	if (!state || !storedState || state !== storedState) {
		throw error(400, 'Invalid state parameter');
	}

	cookies.delete('oauth_state', { path: '/' });

	if (!code) {
		throw error(400, 'No authorization code received');
	}

	try {
		console.log('Attempting token exchange...');
		const tokenData = await exchangeCodeForToken(code);
		console.log('Token exchange successful');

		console.log('Fetching user data...');
		const user = await fetchUserData(tokenData.access_token);
		console.log('User data fetched:', user);

		createSession(cookies, user, tokenData.access_token, tokenData.expires_in);
		console.log('Session created successfully');
	} catch (err) {
		console.error('OAuth callback error:', err);
		console.error('Error details:', err instanceof Error ? err.message : String(err));
		throw error(
			500,
			`Failed to authenticate with Abakus: ${err instanceof Error ? err.message : String(err)}`
		);
	}

	throw redirect(302, '/');
};
