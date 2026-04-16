function decodeBasicAuth(headerValue: string | null): {
  username: string;
  password: string;
} | null {
  if (!headerValue?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = Buffer.from(headerValue.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 0) {
      return null;
    }

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export function isCoaAdminAuthorized(headerValue: string | null): boolean {
  const username = process.env.COA_ADMIN_USERNAME;
  const password = process.env.COA_ADMIN_PASSWORD;
  if (!username || !password) {
    return false;
  }

  const credentials = decodeBasicAuth(headerValue);
  if (!credentials) {
    return false;
  }

  return (
    credentials.username === username && credentials.password === password
  );
}
