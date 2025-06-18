import classNames from 'classnames';
import {IframeHTMLAttributes} from 'react';

import moduleStyles from './iframe.module.scss';

export interface IframeProps extends IframeHTMLAttributes<HTMLIFrameElement> {
  /** URL of the embedded content */
  src: string;
  /** Title */
  title: string;
  /** Class of the embed container */
  className?: string;
  /** Height */
  height?: number | string;
  /** Width */
  width?: number | string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Iframe.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: Iframe Component.
 * Acts as a container for iframe embedded content.
 */
const Iframe: React.FC<IframeProps> = ({
  src,
  title,
  className,
  height = '100%',
  width = '100%',
  ...HTMLAttributes
}: IframeProps) => (
  <iframe
    src={src}
    title={title}
    height={height}
    width={width}
    className={classNames(moduleStyles.iframe, className)}
    {...HTMLAttributes}
  />
);

export default Iframe;
