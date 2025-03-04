import { NextRequest, NextResponse } from "next/server";
import { detectInputType } from "@/utils/detect-input-type";
import { searchTenant } from "@/utils/tenant-search";
import { getEntraLoginInfo } from "@/utils/get-login-info";
import { TenantResponse } from "@/types";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { message: "Missing query parameter" },
      { status: 400 }
    );
  }

  const inputType = detectInputType(query);

  try {
    if (inputType === "tenantId") {
      const response = await searchTenant("tenantId", query);

      if (response.error) {
        return NextResponse.json(
          { message: response.error },
          { status: response.status }
        );
      }

      if (response.cloud === "Commercial" && response.data) {
        return NextResponse.json({
          displayName: response.data?.displayName,
          defaultDomainName: response.data?.defaultDomainName,
          tenantId: response.data?.tenantId,
          cloud: response.cloud,
        });
      }

      return NextResponse.json({
        displayName: null,
        defaultDomainName: null,
        tenantId: response.tenantId,
        cloud: response.cloud,
      });
    } else if (inputType === "domain") {
      try {
        const response = await searchTenant("domain", query);

        if (!response.error) {
          if (response.cloud === "Commercial" && response.data) {
            return NextResponse.json({
              displayName: response.data?.displayName,
              defaultDomainName: response.data?.defaultDomainName,
              tenantId: response.data?.tenantId,
              cloud: response.cloud,
            });
          }

          return NextResponse.json({
            displayName: null,
            defaultDomainName: null,
            tenantId: response.tenantId,
            cloud: response.cloud,
          });
        }
      } catch (error) {
        const dummyEmail = `user@${query}`;
        const loginInfo = await getEntraLoginInfo(dummyEmail);

        return NextResponse.json({
          tenantId: "",
          displayName: loginInfo.FederationBrandName || loginInfo.DomainName,
          defaultDomainName: loginInfo.DomainName,
          cloud: loginInfo.CloudInstanceName || "Commercial",
        });
      }
    } else if (inputType === "email") {
      try {
        const loginInfo = await getEntraLoginInfo(query);

        return NextResponse.json({
          tenantId: "",
          displayName: loginInfo.FederationBrandName || loginInfo.DomainName,
          defaultDomainName: loginInfo.DomainName,
          cloud: loginInfo.CloudInstanceName || "Commercial",
        });
      } catch (emailError) {
        console.error("Email lookup error:", emailError);

        return NextResponse.json(
          { message: "Failed to retrive information for this email" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Invalid input format or tenant not found",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Lookup error: ", error);

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Lookup failed",
      },
      { status: 500 }
    );
  }
}
