import React from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from './button.module.scss';

export interface TagsProps {
  /** Size of button */
  size?: ComponentSizeXSToL;
}

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/TagsTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Tags Component.
 * Can be used to render tags or as a part of bigger/more complex components (e.g. Some forms, blocks/cards).
 */
const Tags: React.FunctionComponent<TagsProps> = ({size = 'm'}) => {
  return (
    <div
      className={classNames(moduleStyles.link, moduleStyles[`link-${size}`])}
    >
      someText
    </div>
  );
};

export default Tags;
