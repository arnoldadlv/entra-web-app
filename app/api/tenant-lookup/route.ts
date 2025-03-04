//api/tenant-lookup/route.ts
import { NextRequest, NextResponse } from "next/server";

import { searchTenant } from "@/utils/tenant-search";

export async function GET(request: NextRequest) {
  //Gets the tenant ID from the URL Query parameter
  const searchParams = request.nextUrl.searchParams;
  const tenantId = searchParams.get("id");

  if (!tenantId) {
    return NextResponse.json(
      { message: "Missing tenant ID parameter" },
      { status: 400 }
    );
  }

  try {
    const response = await searchTenant("tenantId", tenantId);

    if (response.error) {
      return NextResponse.json(
        { message: response.error },
        { status: response.status }
      );
    }

    //COMMERCIAL TENANT ONLY
    if (response.cloud === "Commercial" && response.data) {
      return NextResponse.json({
        displayName: response.data?.displayName,
        defaultDomainName: response.data?.defaultDomainName,
        tenantId: response.data?.tenantId,
        cloud: response.cloud,
      });
    }

    //SOVERIGN CLOUDS ONLY
    return NextResponse.json({
      displayName: null,
      defaultDomainName: null,
      tenantId: response.tenantId,
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
