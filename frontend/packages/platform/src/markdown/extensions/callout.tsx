import classNames from 'classnames';
import type {Components} from 'hast-util-to-jsx-runtime';
import type {ReactNode} from 'react';

import type {MarkdownExtension} from '../extension';

import moduleStyles from './callout.module.scss';

interface CalloutProps {
  /** Visual flavor, e.g. "tip" or "warning". Surfaced as a data attribute. */
  variant?: string;
  className?: string;
  children?: ReactNode;
}

const Callout = ({variant, className, children}: CalloutProps) => (
  <aside
    role="note"
    data-variant={variant}
    className={classNames(moduleStyles.callout, className)}
  >
    {children}
  </aside>
);

/**
 * Renders `<callout variant="tip">...</callout>` as a styled aside.
 *
 * A worked example of the {@link MarkdownExtension} contract: it widens the
 * sanitization allowlist to permit its custom element and the single attribute
 * it reads, and supplies the component that renders it. Nothing here leaks into
 * a `Markdown` that does not enable it.
 */
export const callout: MarkdownExtension = {
  name: 'callout',
  sanitizeSchema: {
    tagNames: ['callout'],
    attributes: {callout: ['variant']},
  },
  // `callout` is not a known intrinsic element, so the map is cast to the
  // component type after building it with the custom key.
  components: {callout: Callout} as Partial<Components>,
};
