// @codemirror/lang-java ships type defs at dist/index.d.ts but doesn't
// expose them via package.json "exports", so node16 module resolution
// can't pick them up. Declare a minimal surface for the symbol we use.
declare module '@codemirror/lang-java' {
  import {LanguageSupport} from '@codemirror/language';
  export function java(): LanguageSupport;
}
