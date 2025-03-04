import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

//Tenant information response from the API
export type TenantResponse = EmailResponse | DomainResponse | TenantIDResponse;

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

//NEW TYPES
interface BaseResponse {
  responseType: "email" | "domain" | "tenantId";
}

//if user inputs emaill, this will be the response structure
export interface EmailResponse extends BaseResponse {
  responseType: "email";
  login: string;
  domainName: string;
  state: number;
  userState: number;
  namespaceType: string;
  federationBrandName?: string;
  cloudInstanceName: string;
  federationProtocol?: string;
}

//if user enters domain, this will be thee response structure
export interface DomainResponse extends BaseResponse {
  responseType: "domain";
  tenantId: string;
  defaultDomainName: string;
  cloud: string;
  displayName?: string | null;
}

//if user enters tenantID, this will be the response
export interface TenantIDResponse extends BaseResponse {
  responseType: "tenantId";
  tenantId: string;
  cloud: string;
  displayName?: string | null;
  issuer?: string;
  endpoints?: {
    authorization?: string;
    token?: string;
    userInfo?: string;
  };
  tenantRegion?: string;
}
