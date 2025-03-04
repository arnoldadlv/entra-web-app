//api/email-lookup/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getEntraLoginInfo } from "@/utils/get-login-info";

import { TenantResponse } from "@/types";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      {
        message: "Missing email paramter",
      },
      { status: 400 }
    );
  }

  try {
    const loginInfo = await getEntraLoginInfo(email);

    //formats the repsonse to match tenantresponse structure
    const tenantResponse: TenantResponse = {
      tenantId: "",
      displayName: loginInfo.FederationBrandName || loginInfo.DomainName,
      defaultDomainName: loginInfo.DomainName,
      cloud: loginInfo.CloudInstanceName || "Commercial",
    };

    return NextResponse.json(tenantResponse);
  } catch (error) {
    console.error("error fetching login info:", error);

    return NextResponse.json(
      { message: "Failed to fetch login information" },
      { status: 500 }
    );
  }
}
