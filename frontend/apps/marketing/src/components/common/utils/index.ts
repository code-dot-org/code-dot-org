import {Brand} from '@/config/brand';
import {getCanonicalHostname} from '@/config/host';
import {Stage} from '@/config/stage';

export function isExternalLink(href: string, brand: Brand, stage: Stage) {
  try {
    const hostname = getCanonicalHostname(brand, stage);

    if (href.startsWith('http://') || href.startsWith('https://')) {
      const url = new URL(href);
      return url.hostname !== hostname;
    }

    return false;
  } catch (e) {
    console.error('Invalid href:', href, e);
    return true;
  }
}
