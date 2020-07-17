import React from 'react';

/**
 * React component that renders a hidden input populated with the name and
 * value for a Rails authenticity token as retrieved from meta tags in the
 * page's head.
 * This is necessary for React-rendered forms to submit to Rails endpoints
 * that have CSRF protection enabled.
 */
export default function RailsAuthenticityToken() {
  const csrfParam = document.querySelector('meta[name="csrf-param"]');
  const csrfToken = document.querySelector('meta[name="csrf-token"]');
  if (csrfParam && csrfToken) {
    return (
      <input type="hidden" name={csrfParam.content} value={csrfToken.content} />
    );
  }
  console.error(
    'Tried to render an authenticity token into the form but no CSRF meta tags were found in the document.'
  );
  return null;
}
