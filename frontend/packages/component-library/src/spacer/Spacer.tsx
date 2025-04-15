import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import type {ComponentSizeXSToL} from '@/common/types';

import moduleStyles from './spacer.module.scss';

export interface SpacerProps extends HTMLAttributes<HTMLDivElement> {
  /** Spacer size */
  size?: ComponentSizeXSToL;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Spacer.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: Spacer Component.
 * Acts as a spacer between elements.
 */
const Spacer: React.FC<SpacerProps> = ({size = 'm', ...HTMLAttributes}) => (
  <div
    role="presentation"
    {...HTMLAttributes}
    className={classNames(
      moduleStyles.spacer,
      moduleStyles[`spacer-size-${size}`],
    )}
  />
);

export default Spacer;
