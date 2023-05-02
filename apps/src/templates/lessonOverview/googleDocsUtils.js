const GDOCS_HOST = 'docs.google.com';
const GDOCS_URL_REGEX =
  /^https?:\/\/docs\.google\.com\/(document|presentation)\/d\/([\w-]+)/;
const SLIDES_PATH_REGEX = /\/presentation\/d\/[\w-]+/;
const DOCS_PATH_REGEX = /\/document\/d\/[\w-]+/;
const EXPORT_PATH = '/export?format=';
const COPY_PATH = '/copy';

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
      SLIDES_PATH_REGEX.test(url.pathname) ||
      DOCS_PATH_REGEX.test(url.pathname)
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
  const matches = GDOCS_URL_REGEX.exec(url);
  const docType = matches[1];
  const docId = matches[2];

  return `https://${GDOCS_HOST}/${docType}/d/${docId}`;
}

// Return a PDF download URL for the given Google Docs link.
export function gDocsPdfUrl(url) {
  return [gDocsBaseUrl(url), EXPORT_PATH, 'pdf'].join('');
}

// Return the appropriate MS Office download URL for the document type.
// If a valid type can't be deterimined, return an invalid URL that will
// direct the user to a Google error page.
export function gDocsMsOfficeUrl(url) {
  let format;
  if (DOCS_PATH_REGEX.test(url)) {
    format = 'doc';
  } else if (SLIDES_PATH_REGEX.test(url)) {
    format = 'pptx';
  }

  return [gDocsBaseUrl(url), EXPORT_PATH, format].join('');
}

// Return a 'Copy Document' URL for the given Google Docs link.
export function gDocsCopyUrl(url) {
  return [gDocsBaseUrl(url), COPY_PATH].join('');
}
