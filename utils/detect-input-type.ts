export type InputType = "email" | "domain" | "tenantId" | "unknown";

export function detectInputType(input: string): InputType {
  //UUID tenant id pattern
  const tenantIdPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  //email pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const domainPattern =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

  if (tenantIdPattern.test(input)) {
    return "tenantId";
  } else if (emailPattern.test(input)) {
    return "email";
  } else if (domainPattern.test(input)) {
    return "domain";
  } else {
    return "unknown";
  }
}
