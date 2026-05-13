import 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'json-video': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        controls?: string | boolean;
        autoplay?: boolean;
      };
    }
  }
}

export {};
