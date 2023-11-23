import React from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import Tag, {TagProps} from './_Tag';
import moduleStyles from './tags.module.scss';

export interface TagsProps {
  /** Array of tags to be rendered */
  tagsList: TagProps[];
  /** Whether we style the tags as disabled or not */
  styleAsDisabled?: boolean;
  /** Size of button */
  size?: Exclude<ComponentSizeXSToL, 'xs'>;
}

// TODO:
// - aria-labels ?
// - tooltips always one line or multiline or both? (tooltip content: string or ReactNode?)
// - connect icons (is left/right icon represents rtl/ltr? languages or should we create both at the same time?)
// - CardLabels.jsx - refactor to use Tags component
// - refactor existing usages
// - remove/refactor Card Labels

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/TagsTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Tags Component.
 * Can be used to render tags or as a part of bigger/more complex components (e.g. Some blocks, cards, etc).
 */
const Tags: React.FunctionComponent<TagsProps> = ({
  tagsList,
  styleAsDisabled = false,
  size = 'm',
}) => (
  <div
    className={classNames(
      moduleStyles.tags,
      moduleStyles[`tags-${size}`],
      styleAsDisabled && moduleStyles.disabledTags
    )}
    data-testid="tags"
  >
    {tagsList.map(({id, label, tooltipContent}) => (
      <Tag
        key={id || label}
        id={id}
        label={label}
        tooltipContent={tooltipContent}
      />
    ))}
  </div>
);

export default Tags;
