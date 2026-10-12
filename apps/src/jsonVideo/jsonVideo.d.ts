import 'react';
import type {JsonVideo} from '@code-dot-org/json-video';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'json-video': React.DetailedHTMLProps<
        React.HTMLAttributes<JsonVideo>,
        JsonVideo
      > & {
        src?: string;
        poster?: string;
        controls?: string | boolean;
        autoplay?: string | boolean;
        loop?: string | boolean;
        muted?: string | boolean;
      };
    }
  }
}
