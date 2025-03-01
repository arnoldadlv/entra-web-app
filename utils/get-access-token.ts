export async function getAccessToken(): Promise<string> {
	const clientID = process.env.ENTRA_CLIENT_ID;
	const clientSecret = process.env.ENTRA_CLIENT_SECRET;
	const tenant = process.env.MY_ENTRA_TENANT_ID;

	if (!clientID || !clientSecret || !tenant) {
		throw new Error("Missing Entra ID Application Credentials in environment variables");
	}

	const params = new URLSearchParams();

	params.append("client_id", clientID);
	params.append("client_secret", clientSecret);
	params.append("scope", "https://graph.microsoft.com/.default");
	params.append("grant_type", "client_credentials");

	const response = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: params,
	});

	if (!response.ok) {
		const error = await response.json();

		throw new Error(`Token fetch failed: ${error}`);
	}
	const tokenResponse = await response.json();

	return tokenResponse.access_token;
}
