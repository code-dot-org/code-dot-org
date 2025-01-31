import React, {memo} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {WithTooltip} from '@cdo/apps/componentLibrary/tooltip';

import moduleStyles from './tags.module.scss';

type TagIconProps = {
  iconName: string;
  iconStyle: 'light' | 'solid' | 'regular' | 'thin';
  title: string;
  placement: 'left' | 'right';
};

const TagIcon: React.FC<TagIconProps> = memo(({iconName, iconStyle, title}) => (
  <FontAwesomeV6Icon iconName={iconName} iconStyle={iconStyle} title={title} />
));

export interface TagProps {
  /** Tag label */
  label: string;
  /** Tag tooltip content. Can be a simple string or ReactNode (some jsx/html markup/view).
   *  For example - check Tags.story.tsx
   *  Can be null to disable the tooltip */
  tooltipContent?: string | React.ReactNode;
  /** Tag tooltip id (required for better accessibility, see ) */
  tooltipId?: string;
  /** aria-label for the tag.
   *  Used to allow screen reader to read tag as ariaLabel content instead of the label content */
  ariaLabel?: string;
  /** Icon (object) to show next to text label (optional).
   *  Icon object consists of icon(icon name/style, title for screenReader,
   *  and the placement of the icon (left or right))*/
  icon?: TagIconProps;
}

const Tag: React.FunctionComponent<TagProps> = ({
  label,
  tooltipContent,
  tooltipId,
  icon,
}) => {
  return tooltipContent && tooltipId ? (
    <WithTooltip
      tooltipProps={{
        direction: 'onTop',
        text: tooltipContent,
        tooltipId,
      }}
    >
      <div
        tabIndex={0} // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
        aria-describedby={tooltipId}
        className={moduleStyles.tag}
      >
        {icon && icon.placement === 'left' && <TagIcon {...icon} />}
        <span>{label}</span>
        {icon && icon.placement === 'right' && <TagIcon {...icon} />}
      </div>
    </WithTooltip>
  ) : (
    <div className={moduleStyles.tag}>
      {icon && icon.placement === 'left' && <TagIcon {...icon} />}
      <span>{label}</span>
      {icon && icon.placement === 'right' && <TagIcon {...icon} />}
    </div>
  );
};

export default memo(Tag);
