import classNames from 'classnames';
import {FunctionComponent} from 'react';

import {ComponentSizeXSToL} from '@/common/types';

import Tag, {TagProps} from './Tag';

import moduleStyles from './tags.module.scss';

export interface TagsProps {
  /** Array of tags to be rendered */
  tagsList: TagProps[];
  /** Size of tag */
  size?: Exclude<ComponentSizeXSToL, 'xs'>;
  /** Optional className for custom styles, etc*/
  className?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/Tags.test.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Tags Component.
 * Can be used to render tags or as a part of bigger/more complex components (e.g. Some blocks, cards, etc).
 */
const Tags: FunctionComponent<TagsProps> = ({
  tagsList,
  size = 'm',
  className,
}) => (
  <div className={classNames(moduleStyles.tags, className)} data-testid="tags">
    {tagsList.map(
      (
        {
          key,
          tooltipId,
          label,
          tooltipContent,
          ariaLabel,
          icon,
          size: tagSize,
          ...props
        },
        index,
      ) => {
        const fallbackKey =
          typeof label === 'string' || typeof label === 'number'
            ? label
            : undefined;

        return (
          <Tag
            key={key ?? tooltipId ?? fallbackKey ?? index}
            size={tagSize ?? size}
            tooltipId={tooltipId}
            label={label}
            ariaLabel={ariaLabel}
            icon={icon}
            tooltipContent={tooltipContent}
            {...props}
          />
        );
      },
    )}
  </div>
);

export default Tags;
