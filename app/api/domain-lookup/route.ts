//Microsoft Graph API calls happen here
import { NextRequest, NextResponse } from "next/server";

import { searchTenant } from "@/utils/tenant-search";

export async function GET(request: NextRequest) {
  //Gets the tenant ID from the URL Query parameter
  const searchParams = request.nextUrl.searchParams;
  const domainName = searchParams.get("domain");

  //validates the tenant ID format
  if (
    !domainName ||
    !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i.test(
      domainName
    )
  ) {
    return NextResponse.json(
      { message: "Invalid tenant domain format" },
      { status: 400 }
    );
  }

  try {
    //Gets access token to make the graph api call

    const response = await searchTenant("domain", domainName);

    //If no error finding tenant

    if (response.error) {
      return NextResponse.json(
        { message: response.error },
        { status: response.status }
      );
    }

    return NextResponse.json({
      displayName: response.data?.displayName,
      defaultDomainName: response.data?.defaultDomainName,
      tenantId: response.data?.tenantId,
      cloud: response.cloud,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "API request failed",
      },
      { status: 500 }
    );
  }
}
