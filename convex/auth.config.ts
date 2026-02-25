import type { AuthConfig } from "convex/server";

const domainRaw = process.env.CLERK_JWT_ISSUER_DOMAIN;
const domain = domainRaw && domainRaw !== "DISABLED" ? domainRaw : undefined;

export default {
  providers: domain
    ? [
        {
          domain,
          applicationID: "convex",
        },
      ]
    : [],
} satisfies AuthConfig;

