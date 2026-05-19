import type {CSSProperties} from 'react';

/**
 * Ambient declaration for the JS styles module.  Values are inline style
 * objects; the index signature is CSSProperties so TSX files can pass style
 * values without casting.  Cast to `as CSSProperties` at the call site when
 * required for non-standard vendor keys.
 */
declare const styles: Record<string, CSSProperties>;
export default styles;
