"use client";
// components/tenant-lookup-form.tsx
import { useState } from "react";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { alert } from "@heroui/theme";
import { Spinner } from "@heroui/spinner";

import { TenantResponse } from "@/types";

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

      {tenantInfo && (
        <div className="p-4 rounded-lg border">
          <h3 className="font-bold">Tenant Information</h3>
          <div className="mt-2 space-y-2">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {tenantInfo.displayName || "Not available"}
            </p>
            <p>
              <span className="font-medium">Domain:</span>{" "}
              {tenantInfo.defaultDomainName}
            </p>
            <p>
              <span className="font-medium">ID:</span>{" "}
              {tenantInfo.tenantId || "Not available"}
            </p>
            <p>
              <span className="font-medium">Cloud:</span> {tenantInfo.cloud}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
