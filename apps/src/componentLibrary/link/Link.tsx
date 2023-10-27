import React from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from './link.module.scss';

export interface LinkProps {
  /** Size of link */
  size?: ComponentSizeXSToL;
}

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/LinkTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Link Component.
 * Can be used to render a checkbox or as a part of bigger/more complex components (e.g. Checkbox Dropdown).
 */
const Link: React.FunctionComponent<LinkProps> = ({size = 'm'}) => {
  return (
    <a className={classNames(moduleStyles.link, moduleStyles[`link-${size}`])}>
      someText
    </a>
  );
};

export default Link;
