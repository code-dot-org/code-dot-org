import type {ConsentCategory} from '@/plugins/consent/types';

/**
 * OneTrust `C000x` group codes mapped to semantic consent categories.
 * The tenant also defines C0005 (Social Media), C0008 (Marketing) and
 * C0012 (Misc Blocked); they are deliberately unmapped — no consumer reads
 * them. Extend `ConsentCategory` before mapping a new group here.
 */
export const CATEGORY_MAP: Record<string, ConsentCategory> = {
  C0001: 'strictly-necessary',
  C0002: 'performance',
  C0003: 'functional',
  C0004: 'targeting',
};
