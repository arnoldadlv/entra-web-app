"use client";
// components/tenant-lookup-form.tsx
import { useState } from "react";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { alert } from "@heroui/theme";
import { Spinner } from "@heroui/spinner";

import {
  TenantResponse,
  EmailResponse,
  DomainResponse,
  TenantIDResponse,
} from "@/types";

export default function TenantLookupForm() {
  const [searchValue, setSearchValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tenantInfo, setTenantInfo] = useState<TenantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateInput = (value: string): boolean => {
    if (!value.trim()) {
      setValidationError("Please enter a tenant ID, domain, or email");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    // Clear previous results when input changes
    if (tenantInfo) setTenantInfo(null);
    if (error) setError(null);

    // Real-time validation for better user feedback
    if (value) validateInput(value);
  };

  const lookupTenant = async () => {
    // Reset states
    setError(null);
    setTenantInfo(null);

    // Validate input
    if (!validateInput(searchValue)) return;

    setIsLoading(true);

    try {
      // Use the new unified endpoint
      const endpoint = `/api/unified-lookup?query=${encodeURIComponent(searchValue)}`;

      // Call the API endpoint
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to lookup information");
      }

      setTenantInfo(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Render different info cards based on response type
  const renderTenantInfoCard = () => {
    if (!tenantInfo) return null;

    // Common card container
    return (
      <div className="p-4 rounded-lg border">
        <h3 className="font-bold">
          {tenantInfo.responseType === "email"
            ? "Email Information"
            : tenantInfo.responseType === "domain"
              ? "Domain Information"
              : "Tenant Information"}
        </h3>
        <div className="mt-2 space-y-2">
          {/* Render different fields based on response type */}
          {tenantInfo.responseType === "email" &&
            renderEmailInfo(tenantInfo as EmailResponse)}
          {tenantInfo.responseType === "domain" &&
            renderDomainInfo(tenantInfo as DomainResponse)}
          {tenantInfo.responseType === "tenantId" &&
            renderTenantIdInfo(tenantInfo as TenantIDResponse)}
        </div>
      </div>
    );
  };

  // Render email-specific information
  const renderEmailInfo = (info: EmailResponse) => (
    <>
      <p>
        <span className="font-medium">Login:</span> {info.login}
      </p>
      <p>
        <span className="font-medium">Domain:</span> {info.domainName}
      </p>
      <p>
        <span className="font-medium">Login State:</span>{" "}
        {info.state === 1
          ? "Active"
          : info.state === 4
            ? "Federated"
            : info.state}
      </p>
      <p>
        <span className="font-medium">Account Type:</span> {info.namespaceType}
      </p>
      {info.federationBrandName && (
        <p>
          <span className="font-medium">Federation Brand:</span>{" "}
          {info.federationBrandName}
        </p>
      )}
      <p>
        <span className="font-medium">Cloud:</span> {info.cloudInstanceName}
      </p>
      {info.federationProtocol && (
        <p>
          <span className="font-medium">Federation Protocol:</span>{" "}
          {info.federationProtocol}
        </p>
      )}
    </>
  );

  // Render domain-specific information
  const renderDomainInfo = (info: DomainResponse) => (
    <>
      {info.displayName && (
        <p>
          <span className="font-medium">Organization:</span> {info.displayName}
        </p>
      )}
      <p>
        <span className="font-medium">Domain:</span> {info.defaultDomainName}
      </p>
      {info.tenantId && (
        <p>
          <span className="font-medium">Tenant ID:</span> {info.tenantId}
        </p>
      )}
      <p>
        <span className="font-medium">Cloud:</span> {info.cloud}
      </p>
    </>
  );

  // Render tenant ID-specific information
  const renderTenantIdInfo = (info: TenantIDResponse) => (
    <>
      <p>
        <span className="font-medium">Tenant ID:</span> {info.tenantId}
      </p>
      {info.displayName && (
        <p>
          <span className="font-medium">Organization:</span> {info.displayName}
        </p>
      )}
      <p>
        <span className="font-medium">Cloud:</span> {info.cloud}
      </p>
      {info.tenantRegion && (
        <p>
          <span className="font-medium">Region:</span> {info.tenantRegion}
        </p>
      )}
      {info.issuer && (
        <p>
          <span className="font-medium">Issuer:</span> {info.issuer}
        </p>
      )}
      {info.endpoints && (
        <div className="mt-4">
          <p className="font-medium">Authentication Endpoints:</p>
          <div className="pl-4 mt-1 text-sm">
            {info.endpoints.authorization && (
              <p>
                <span className="font-medium">Authorization:</span>{" "}
                <span className="text-blue-600 break-all">
                  {info.endpoints.authorization}
                </span>
              </p>
            )}
            {info.endpoints.token && (
              <p>
                <span className="font-medium">Token:</span>{" "}
                <span className="text-blue-600 break-all">
                  {info.endpoints.token}
                </span>
              </p>
            )}
            {info.endpoints.userInfo && (
              <p>
                <span className="font-medium">User Info:</span>{" "}
                <span className="text-blue-600 break-all">
                  {info.endpoints.userInfo}
                </span>
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="w-full">
      <Form
        className="mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          lookupTenant();
        }}
      >
        <Input
          description="Enter a Tenant ID, domain, or email address to look up tenant information"
          errorMessage={validationError || ""}
          id="search-value"
          isInvalid={!!validationError}
          label="Tenant ID, Domain, or Email"
          name="search-value"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx or contoso.com or user@contoso.com"
          value={searchValue}
          onChange={handleInputChange}
        />
      </Form>

      <Button
        className="w-full mb-6"
        color="primary"
        disabled={isLoading || !!validationError}
        size="lg"
        variant="shadow"
        onPress={lookupTenant}
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" size="sm" />
            Looking up...
          </>
        ) : (
          "Lookup Tenant"
        )}
      </Button>

      {error && (
        <div className={alert({ color: "danger" }) + " mb-6"}>
          <div className="font-medium">Error</div>
          <div>{error}</div>
        </div>
      )}

      {tenantInfo && renderTenantInfoCard()}
    </div>
  );
}
