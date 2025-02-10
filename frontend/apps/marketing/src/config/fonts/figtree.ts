import {Figtree} from 'next/font/google';

/**
 * Figtree is the primary font for Code.org. Figtree must render (block rendering).
 */
export const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin', 'latin-ext'],
  display: 'block',
});
