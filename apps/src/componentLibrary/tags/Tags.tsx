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
  /** Optional className for custom styles, etc*/
  className?: string;
}

// TODO:
// - tooltips are required;
// - we can have left icon OR right icon, NOT both;
// - tooltip should have max width of 325px / 20.312rem;
// - tooltip can be one line OR multiline OR both;
// - tag should have an optional onClick handler;
// - disabled tag should not have onClick handler, but everything else it should have;

// TODO 2: check if we can add an icons inside of native html select item/option content

// - tooltips always one line or multiline or both? (tooltip content: string or ReactNode?)
// - (is left/right icon represents rtl/ltr? languages or should we create both at the same time?
// - CardLabels.jsx - refactor to use Tags component
// - refactor existing usages

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
  className,
}) => (
  <div
    className={classNames(
      moduleStyles.tags,
      moduleStyles[`tags-${size}`],
      styleAsDisabled && moduleStyles.disabledTags,
      className
    )}
    data-testid="tags"
  >
    {tagsList.map(({tooltipId, label, tooltipContent, ariaLabel}) => (
      <Tag
        key={tooltipId || label}
        tooltipId={tooltipId}
        label={label}
        ariaLabel={ariaLabel}
        tooltipContent={tooltipContent}
      />
    ))}
  </div>
);

export default Tags;
