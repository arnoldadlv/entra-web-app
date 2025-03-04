import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

//Tenant information response from the API
export interface TenantResponse {
  tenantId: string;
  displayName: string;
  defaultDomainName: string;
  cloud: string;
}

//Error response structure
export interface ApiError {
  message: string;
  statusCode: number;
}

export interface GraphApiResponse {
  id: string;
  displayName: string;
  verifiedDomains: {
    name: string;
    type: string;
    isDefault: boolean;
  }[];
}

//Microsoft Graph API Response structure
export interface GraphApiTenantResponse {
  tenantId: string;
  displayName: string;
  defaultDomainName: string;
  verifiedDomains: VerifiedDomain[];
}

export interface VerifiedDomain {
  name: string;
  type: string;
  isDefault: boolean;
}

//Form validation state
export interface ValidationState {
  isValid: boolean;
  message: string | null;
}
