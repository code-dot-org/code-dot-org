import React from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from './button.module.scss';

export interface ButtonProps {
  /** Size of button */
  size?: ComponentSizeXSToL;
}

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/ButtonTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Button Component.
 * Can be used to render a button or as a part of bigger/more complex components (e.g. Some forms, blocks/cards).
 */
const Button: React.FunctionComponent<ButtonProps> = ({size = 'm'}) => {
  return (
    <button
      type="button"
      className={classNames(moduleStyles.link, moduleStyles[`link-${size}`])}
    >
      someText
    </button>
  );
};

export default Button;
