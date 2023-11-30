import React from 'react';

import {
  OverlayTrigger,
  Tooltip,
  TooltipProps,
  OverlayTriggerProps,
} from 'react-bootstrap-2'; // TODO: Once we have [DSCO] Tooltip component, replace this import with it

import moduleStyles from './tags.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

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

export interface TagProps {
  /** Tag label */
  label: string;
  /** Tag tooltip content. Can be a simple string or ReactNode (some jsx/html markup/view).
   *  For example - check Tags.story.tsx*/
  tooltipContent: string | React.ReactNode;
  /** Tag tooltip id (required for accessibility) */
  tooltipId: string;
  /** aria-label for the tag.
   *  Used to allow screen reader to read tag as ariaLabel content instead of the label content */
  ariaLabel?: string;
  /** Icon to show next to text label (optional)*/
  icon?: string;
}

const Tag: React.FunctionComponent<TagProps> = ({
  label,
  tooltipContent,
  tooltipId,
  ariaLabel,
  icon,
}) => {
  return (
    <LabelOverlayTrigger
      overlay={(props: TooltipProps) => (
        <LabelTooltip
          id={tooltipId || ''}
          className={moduleStyles.tagTooltip}
          {...props}
        >
          {tooltipContent}
        </LabelTooltip>
      )}
    >
      <div tabIndex={0} role="tooltip" aria-label={ariaLabel}>
        {label}
        {/*Todo: create DSCO icon component. Empty className and title props are here to fix typescript type errors*/}
        {icon && <FontAwesome icon={icon} className="" title="" />}
      </div>
    </LabelOverlayTrigger>
  );
};

export default Tag;
