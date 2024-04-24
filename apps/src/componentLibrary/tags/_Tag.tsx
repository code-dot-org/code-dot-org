import React, {memo} from 'react';
import {
  OverlayTrigger,
  Tooltip,
  TooltipProps,
  OverlayTriggerProps,
} from 'react-bootstrap-2'; // TODO: Once we have [DSCO] Tooltip component, replace this import with it

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from './tags.module.scss';

// Allow the tooltips to display on focus so that the information
// can be shown via keyboard
const LabelOverlayTrigger: React.FC<OverlayTriggerProps> = props => (
  <OverlayTrigger placement="top" trigger={['hover', 'focus']} {...props} />
);

// The arrowProps passed down in ReactBootstrap use styles that
// conflict with the custom styles that we want, so they
// are extracted out here.
const LabelTooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({arrowProps, ...props}, ref: React.Ref<HTMLDivElement>) => (
    <Tooltip ref={ref} {...props} />
  )
);

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
   *  For example - check Tags.story.tsx*/
  tooltipContent: string | React.ReactNode;
  /** Tag tooltip id (required for better accessibility, see ) */
  tooltipId: string;
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
  return (
    <LabelOverlayTrigger
      overlay={(props: TooltipProps) => (
        <LabelTooltip
          id={tooltipId}
          className={moduleStyles.tagTooltip}
          {...props}
        >
          {tooltipContent}
        </LabelTooltip>
      )}
    >
      <div
        tabIndex={0} // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
        role="tooltip"
        aria-describedby={tooltipId}
        className={moduleStyles.tag}
      >
        {icon && icon.placement === 'left' && <TagIcon {...icon} />}
        <span>{label}</span>
        {icon && icon.placement === 'right' && <TagIcon {...icon} />}
      </div>
    </LabelOverlayTrigger>
  );
};

export default memo(Tag);
