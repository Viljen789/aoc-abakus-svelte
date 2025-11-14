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

export interface MinimalAbakusUser {
	id: number;
	username: string;
	fullName: string;
	githubUsername: string;
}

export function getAuthorizationUrl(state: string): string {
	const params = new URLSearchParams({
		client_id: ABAKUS_CLIENT_ID,
		redirect_uri: ABAKUS_REDIRECT_URI,
		response_type: 'code',
		scope: 'aoc',
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

	console.log('Parsed user data:', {
		id: data.id,
		username: data.username,
		full_name: data.full_name,
		fullName: data.fullName,
		github_username: data.github_username,
		githubUsername: data.githubUsername
	});

	// Handle both full response and minimal response (with 'aoc' scope)
	const result = {
		id: data.id,
		username: data.username,
		firstName: data.first_name || data.firstName || '',
		lastName: data.last_name || data.lastName || '',
		fullName: data.full_name || data.fullName,
		githubUsername: data.github_username || data.githubUsername || ''
	};

	console.log('Returning user object:', result);
	return result;
}

// CSRF protection
export function generateState(): string {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function fetchAllUsers(accessToken: string): Promise<MinimalAbakusUser[]> {
	console.log('Fetching all users with minimal fields');

	const response = await fetch(`${ABAKUS_API_URL}/api/v1/users/?minimal=true`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const responseText = await response.text();
		throw new Error(`Failed to fetch users: ${responseText}`);
	}

	const data = await response.json();

	// API returns paginated results with a 'results' array
	const users = data.results || data;

	console.log('Sample user from API:', JSON.stringify(users[0], null, 2));

	return users.map((user: any) => ({
		id: user.id,
		username: user.username,
		fullName: user.fullName || user.full_name,
		githubUsername: user.githubUsername || user.github_username
	}));
}
