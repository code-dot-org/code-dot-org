/**
 * A utility for retrieving the Rails authenticity token, needed for certain
 * requests made to dashboard. On some pages, this is passed down as part of the
 * DOM, but in others, it may need to be retrieved by a separate AJAX request.
 */

let authenticityToken: string | null = null;

async function getAuthenticityToken(): Promise<string> {
  if (authenticityToken !== null) {
    return authenticityToken;
  }

  const token = await refreshToken();
  authenticityToken = token;
  return authenticityToken;
}

async function refreshToken(): Promise<string> {
  // Retrieve token from DOM if present
  const tokenContainer = document.querySelector<HTMLMetaElement>(
    'meta[name="csrf-token"]'
  );

  if (tokenContainer && tokenContainer.content) {
    return tokenContainer.content;
  }

  // Request a token from dashboard
  const response = await fetch('/get_token');
  const token = response.headers.get('csrf-token');
  if (token === null) {
    throw new Error('Could not retrieve CSRF token');
  }
  return token;
}

export {getAuthenticityToken};
export const AUTHENTICITY_TOKEN_HEADER = 'X-CSRF-TOKEN';
