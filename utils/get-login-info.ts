//utils/get-login-info.ts
interface EntraLoginInfo {
  State: number; //1 = Active, 4= Federated Domain
  UserState: number; //1=Existing User
  Login: string;
  NameSpaceType: "Managed" | "Federated";
  DomainName: string;
  FederationBrandName?: string;
  CloudInstanceName: string;
  CloudInstanceIssuerUri: string;
  //Optional
  AuthURL?: string;
  FederationProtocol?: string;
  CertAuthUrl?: string;
}

export async function getEntraLoginInfo(
  userEmail: string
): Promise<EntraLoginInfo> {
  const encodedEmail = encodeURIComponent(userEmail);
  const response = await fetch(
    `https://login.microsoftonline.com/GetUserRealm.srf?login=${encodedEmail}`
  );

  if (!response.ok) {
    throw new Error(`Error, Status: ${response.status}`);
  }

  const data = await response.json();

  return {
    State: data.State,
    UserState: data.UserState,
    Login: data.Login,
    NameSpaceType: data.NameSpaceType,
    DomainName: data.DomainName,
    FederationBrandName: data.FederationBrandName,
    CloudInstanceName: data.CloudInstanceName,
    CloudInstanceIssuerUri: data.CloudInstanceIssuerUri,
    ...(data.AuthURL && { AuthURL: data.AuthURL }),
    ...(data.FederationProtocol && {
      FederationProtocol: data.FederationProtocol,
    }),
    ...(data.CertAuthUrl && { CertAuthUrl: data.CertAuthUrl }),
  };
}
