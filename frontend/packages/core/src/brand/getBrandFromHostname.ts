import type {parse} from 'tldjs';
import type {Brand} from './brand';

export function getBrandFromHostname(
  parsedHostname: ReturnType<typeof parse>,
): Brand {
  const rootDomain = parsedHostname.domain;

  switch (rootDomain) {
    case 'code.org':
      return 'code.org';
    case 'aiday.org':
      return 'aiday';
    default:
      return 'code.org';
  }
}
