import React from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import Tag, {TagProps} from './_Tag';
import moduleStyles from './tags.module.scss';

export interface TagsProps {
  /** Array of tags to be rendered */
  tagsList: TagProps[];
  /** Size of button */
  size?: Exclude<ComponentSizeXSToL, 'xs'>;
  /** Optional className for custom styles, etc*/
  className?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/TagsTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Tags Component.
 * Can be used to render tags or as a part of bigger/more complex components (e.g. Some blocks, cards, etc).
 */
const Tags: React.FunctionComponent<TagsProps> = ({
  tagsList,
  size = 'm',
  className,
}) => (
  <div
    className={classNames(
      moduleStyles.tags,
      moduleStyles[`tags-${size}`],
      className
    )}
    data-testid="tags"
  >
    {tagsList.map(({tooltipId, label, tooltipContent, ariaLabel, icon}) => (
      <Tag
        key={tooltipId}
        tooltipId={tooltipId}
        label={label}
        ariaLabel={ariaLabel}
        icon={icon}
        tooltipContent={tooltipContent}
      />
    ))}
  </div>
);

export default Tags;
