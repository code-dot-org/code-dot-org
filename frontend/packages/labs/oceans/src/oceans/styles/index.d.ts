import type {CSSProperties} from 'react';

/**
 * Ambient declaration for the JS styles module.  The actual values are inline
 * style objects consumed by Radium; we declare the index signature as
 * CSSProperties so TSX files can pass style values without casting.
 * Individual style entries may include Radium-specific array syntax and
 * non-standard vendor keys — cast to `as React.CSSProperties` at the call
 * site when required.
 */
declare const styles: Record<string, CSSProperties>;
export default styles;
