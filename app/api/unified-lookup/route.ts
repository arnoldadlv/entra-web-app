import { NextRequest, NextResponse } from "next/server";

import { TenantResponse } from "../../../types/index";

import { detectInputType } from "@/utils/detect-input-type";
import { searchTenant } from "@/utils/tenant-search";
import { getEntraLoginInfo } from "@/utils/get-login-info";
import { EmailResponse, DomainResponse, TenantIDResponse } from "@/types/index";
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
    //handles Tenant ID Input
    if (inputType === "tenantId") {
      const response = await searchTenant("tenantId", query);

      //If there is an error, return the error message and the error status
      if (response.error) {
        return NextResponse.json(
          { message: response.error },
          { status: response.status }
        );
      }

      const tenantResponse: TenantIDResponse = {
        responseType: "tenantId",
        tenantId: response.tenantId || query,
        cloud: response.cloud || "Unknown",
        displayName: response.data?.displayName || null,
        //adds oidc specific fields if needed
        issuer: response.issuer,
        endpoints: {
          authorization: response.authorization_endpoint,
          token: response.token_endpoint,
          userInfo: response.userinfo_endpoint,
        },
        tenantRegion: response.tenant_region_scope,
      };

      return NextResponse.json(tenantResponse);

      // if the cloud is commercial in the response, and response is successful, return this
      if (response.cloud === "Commercial" && response.data) {
        return NextResponse.json({
          displayName: response.data?.displayName,
          defaultDomainName: response.data?.defaultDomainName,
          tenantId: response.data?.tenantId,
          cloud: response.cloud,
        });
      }

      // Return this if it doesn't meet neither of the if statements above
      return NextResponse.json({
        displayName: null,
        defaultDomainName: null,
        tenantId: response.tenantId,
        cloud: response.cloud,
      });
    } else if (inputType === "domain") {
      //do this if input is a domain
      try {
        const response = await searchTenant("domain", query);

        if (!response.error) {
          const domainResponse: DomainResponse = {
            responseType: "domain",
            tenantId: response.tenantId || "",
            defaultDomainName: query,
            cloud: response.cloud || "Commercial",
            displayName: response.data?.displayName || null,
          };

          return NextResponse.json(domainResponse);
        }
      } catch (error) {
        //fallback to user realm lookup with dummy email
        const dummyEmail = `user@${query}`;
        const loginInfo = await getEntraLoginInfo(dummyEmail);

        return NextResponse.json({
          tenantId: "",
          displayName: loginInfo.FederationBrandName || loginInfo.DomainName,
          defaultDomainName: loginInfo.DomainName,
          cloud: loginInfo.CloudInstanceName || "Commercial",
        });
      }
      //if user input is an email, do this
    } else if (inputType === "email") {
      try {
        const loginInfo = await getEntraLoginInfo(query);

        const emailResponse: EmailResponse = {
          responseType: "email",
          login: loginInfo.Login,
          domainName: loginInfo.DomainName,
          state: loginInfo.State,
          userState: loginInfo.UserState,
          namespaceType: loginInfo.NameSpaceType,
          federationBrandName: loginInfo.FederationBrandName,
          cloudInstanceName: loginInfo.CloudInstanceName,
          federationProtocol: loginInfo.FederationProtocol,
        };

        return NextResponse.json(emailResponse);
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
