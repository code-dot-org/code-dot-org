/** The slice of a TanStack route match the root shell reads. */
interface FooterAwareMatch {
  staticData: {hideFooter?: boolean};
}

/** True if any matched route (root through leaf) opts out of the footer. */
export function shouldHideFooter(matches: FooterAwareMatch[]): boolean {
  return matches.some(match => match.staticData.hideFooter === true);
}
