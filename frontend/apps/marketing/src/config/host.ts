/**
 * Returns the localhost domain
 */
export function getLocalhostDomain() {
  const port = process.env.PORT || '3000';
  return `localhost:${port}`;
}

/**
 * Returns the localhost address based on the PORT environment variable.
 */
export function getLocalhostAddress() {
  return `http://${getLocalhostDomain()}`;
}
