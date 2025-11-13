import {
	ABAKUS_API_URL,
	ABAKUS_CLIENT_ID,
	ABAKUS_CLIENT_SECRET,
	ABAKUS_REDIRECT_URI
} from '$env/static/private';

export interface AbakusUser {
	id: number;
	username: string;
	firstName: string;
	lastName: string;
	fullName: string;
	githubUsername: string;
}

export function getAuthorizationUrl(state: string): string {
	const params = new URLSearchParams({
		client_id: ABAKUS_CLIENT_ID,
		redirect_uri: ABAKUS_REDIRECT_URI,
		response_type: 'code',
		scope: 'user',
		state
	});

	return `${ABAKUS_API_URL}/authorization/oauth2/authorize/?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{
	access_token: string;
	expires_in: number;
	token_type: string;
	refresh_token?: string;
}> {
	const params = new URLSearchParams({
		client_id: ABAKUS_CLIENT_ID,
		client_secret: ABAKUS_CLIENT_SECRET,
		redirect_uri: ABAKUS_REDIRECT_URI,
		grant_type: 'authorization_code',
		code
	});

	console.log('Token exchange URL:', `${ABAKUS_API_URL}/authorization/oauth2/token/`);
	console.log('Token exchange params:', params.toString());

	const response = await fetch(`${ABAKUS_API_URL}/authorization/oauth2/token/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: params.toString()
	});

	const responseText = await response.text();
	console.log('Token response status:', response.status);
	console.log('Token response:', responseText);

	if (!response.ok) {
		throw new Error(`Failed to exchange code for token: ${responseText}`);
	}

	return JSON.parse(responseText);
}

export async function fetchUserData(accessToken: string): Promise<AbakusUser> {
	console.log('Fetching user data with token:', accessToken.substring(0, 20) + '...');

	const response = await fetch(`${ABAKUS_API_URL}/api/v1/users/oauth2_userdata/`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}
	});

	const responseText = await response.text();
	console.log('User data response status:', response.status);
	console.log('User data response:', responseText);

	if (!response.ok) {
		throw new Error(`Failed to fetch user data: ${responseText}`);
	}

	const data = JSON.parse(responseText);

	return {
		id: data.id,
		username: data.username,
		firstName: data.firstName,
		lastName: data.lastName,
		fullName: data.fullName,
		githubUsername: data.githubUsername
	};
}

// CSRF protection
export function generateState(): string {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
