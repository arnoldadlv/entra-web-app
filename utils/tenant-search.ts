import { getAccessToken } from "./get-access-token";

import { GraphApiTenantResponse } from "@/types";

type SearchType = "tenantId" | "domain";

interface SearchResult {
	data?: GraphApiTenantResponse;
	defaultDomainName?: string;
	error?: string;
	cloud?: string;
	tenantId?: string;
	status: number;
}

export async function searchTenant(searchType: SearchType, searchValue: string): Promise<SearchResult> {
	try {
		// First check tenant validity and determine cloud environment
		const oidcResponse = await fetch(`https://login.microsoftonline.com/${searchValue}/.well-known/openid-configuration`);

		if (!oidcResponse.ok) throw new Error("Invalid tenant/domain");

		const oidcData = await oidcResponse.json();
		const { issuer } = oidcData;
		const tenantId = issuer.split("/")[3]; // Extract from "https://sts.windows.net/{tenantId}/"

		//determine cloud enviornment, Commercia, GCC High, etc.
		const cloud = oidcData.tenant_region_scope === "USGov" ? "GCC High" : "Commercial";

		//return what we are able to for GCC High tenants and DoD, cannot use .us endpoint for graph API

		if (cloud !== "Commercial") {
			return {
				tenantId: tenantId,
				defaultDomainName: searchType === "tenantId" ? searchValue : undefined,
				cloud: cloud,
				status: 200,
			};
		}

		// COMMERCIAL CLOUD ONLY
		// Get access token for Graph API
		const accessToken = await getAccessToken();

		// Call Microsoft Graph API to get tenant details
		const graphResponse = await fetch(`https://graph.microsoft.com/v1.0/tenantRelationships/findTenantInformationByDomainName(domainName='${tenantId}')`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!graphResponse.ok) {
			throw new Error(`Graph API error: ${graphResponse.status}`);
		}

		const tenantData = await graphResponse.json();

		return {
			data: tenantData,
			tenantId: tenantId,
			cloud: cloud,
			status: 200,
		};
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : "Tenant lookup failed",
			status: 500,
		};
	}
}
