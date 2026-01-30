/*
 * Shorten an external URL to the first directory after the hostname.
 * @param url - The external URL to shorten.
 * @returns The shortened external URL.
 * @example
 * shortenExternalURL('https://res.klook.com/image/upload/fl_lossy.progressive.jpg') // 'res.klook.com/image'
 * shortenExternalURL('https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden.jpg') // 'hips.hearstapps.com/hmg-prod'
 */
export const shortenExternalURL = (url: string) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;
    if (pathname === '/' || pathname === '') {
      return hostname; // No path, just return hostname.
    }
    // Get first directory after hostname
    const pathParts = pathname.split('/').filter(part => part !== '');
    if (pathParts.length === 0) {
      return hostname;
    }
    // Return hostname plus path to next forward slash
    return `${hostname}/${pathParts[0]}`;
  } catch {
    // If URL parsing fails, try to extract manually.
    const withoutProtocol = url.replace(/^https?:\/\//, '');
    const parts = withoutProtocol.split('/').filter(part => part !== '');
    if (parts.length === 0) {
      return url; // Fallback to original.
    }
    if (parts.length === 1) {
      return parts[0]; // Just hostname.
    }
    // Return hostname plus first directory
    return `${parts[0]}/${parts[1]}`;
  }
};
