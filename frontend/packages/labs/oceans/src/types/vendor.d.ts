/**
 * Minimal ambient declarations for untyped third-party packages used by the
 * oceans lab.  These shims are intentionally narrow — only the call signatures
 * actually used in this codebase are declared.
 */

declare module 'react-typist' {
  import type {Component, ReactNode} from 'react';
  interface TypistProps {
    avgTypingDelay?: number;
    stdTypingDelay?: number;
    cursor?: {show?: boolean};
    onTypingDone?: () => void;
    children?: ReactNode;
  }
  class Typist extends Component<TypistProps> {}
  export = Typist;
}

declare module 'rehype-react' {
  /** Rehype plugin that compiles hast to React elements. */
  function rehypeReact(...args: unknown[]): unknown;
  export = rehypeReact;
}

declare module 'remark-rehype' {
  /** Remark plugin that transforms mdast to hast. */
  function remarkRehype(...args: unknown[]): unknown;
  export = remarkRehype;
}

declare module '@code-dot-org/redactable-markdown' {
  interface MarkdownParser {
    use(
      plugin: (...args: unknown[]) => unknown,
      options?: object,
    ): MarkdownParser;
    processSync(content: string): {contents: unknown};
  }
  interface ParserFactory {
    create(): {getParser(): MarkdownParser};
  }
  const Parser: ParserFactory;
  export = Parser;
}

declare module 'query-string' {
  const queryString: {
    /** Parses a URL query string into a key-value map. */
    parse(str: string): Record<string, string | string[] | null>;
  };
  export default queryString;
}

// Augment Window for legacy analytics calls used in words.tsx.
interface Window {
  trackEvent?: (category: string, action: string, label?: string) => void;
}
