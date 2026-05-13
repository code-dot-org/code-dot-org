// The @codemirror/lang-java package ships without TypeScript declarations in
// the version we have pinned. The exported `java()` returns a LanguageSupport
// instance; that is all we need here.
declare module '@codemirror/lang-java' {
  import {LanguageSupport} from '@codemirror/language';
  export function java(): LanguageSupport;
}
