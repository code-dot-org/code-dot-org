const GDOCS_HOST = 'docs.google.com';
const GDOCS_REGEX = /^https?:\/\/docs\.google\.com\/(document|presentation)\/d\/([\w-]+)\//;
const GDOCS_SLIDES_REGEX = /\/presentation\/d\/[\w-]+/;
const GDOCS_DOCS_REGEX = /\/document\/d\/[\w-]+/;
const GDOCS_EXPORT = '/export?format=';
const GDOCS_COPY = '/copy';

// Check whether the given string is a Google Docs URL in a format we
// know how to parse. Note some valid Google Docs URLs may return `false`
// here, if they aren't in the format we know how to interpret. The other
// Google Docs functions below expect that the URL they're acting on has
// already passed this function's checks.
// Example valid URL: https://docs.google.com/document/d/SOME_LONG_ID
export function isGDocsUrl(s) {
  try {
    const url = new URL(s);
    if (url.host !== GDOCS_HOST) {
      return false;
    }

    if (
      GDOCS_SLIDES_REGEX.test(url.pathname) ||
      GDOCS_DOCS_REGEX.test(url.pathname)
    ) {
      // The URL has the correct host, and a path we know how to parse.
      return true;
    }
  } catch (err) {
    // Expect TypeError if `s` is not a valid URL.
    return false;
  }
  return false;
}

// Return a Google Docs URL in the expected format, to be appended to by
// the more specific functions below. May raise TypeError if the URL has
// not been checked for validity with isGDocsUrl.
export function gDocsBaseUrl(url) {
  const matches = GDOCS_REGEX.exec(url);
  const docType = matches[1];
  const docId = matches[2];

  return `https://${GDOCS_HOST}/${docType}/d/${docId}`;
}

// Return a PDF download URL for the given Google Docs link.
export function gDocsPdfUrl(url) {
  return [gDocsBaseUrl(url), GDOCS_EXPORT, 'pdf'].join('');
}

// Return the appropriate MS Office download URL for the document type.
// If a valid type can't be deterimined, return an invalid URL that will
// direct the user to a Google error page.
export function gDocsMsOfficeUrl(url) {
  let format;
  if (GDOCS_DOCS_REGEX.test(url)) {
    format = 'doc';
  } else if (GDOCS_SLIDES_REGEX.test(url)) {
    format = 'pptx';
  }

  return [gDocsBaseUrl(url), GDOCS_EXPORT, format].join('');
}

// Return a 'Copy Document' URL for the given Google Docs link.
export function gDocsCopyUrl(url) {
  return [gDocsBaseUrl(url), GDOCS_COPY].join('');
}
