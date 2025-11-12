import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateState, getAuthorizationUrl } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const state = generateState();

	//Debugging
	/*console.log('=== Login Initiated ===');
	console.log('Generated state:', state);*/

	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: false, // Change to false for local development
		sameSite: 'lax',
		maxAge: 60 * 10
	});

	const authUrl = getAuthorizationUrl(state);
	//Debugging
	/*console.log('Redirecting to:', authUrl);
	console.log('======================');*/

	throw redirect(302, authUrl);
};
