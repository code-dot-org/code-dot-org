import React from 'react';

import {
  OverlayTrigger,
  Tooltip,
  TooltipProps,
  OverlayTriggerProps,
} from 'react-bootstrap-2'; // TODO: Once we have [DSCO] Tooltip component, replace this import with it

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

export interface TagProps {
  /** Tag label */
  label: string;
  /** Tag tooltip text */
  tooltipContent: string | React.ReactNode;
  /** Tag tooltip id (optional) */
  tooltipId?: string;
  /** aria-label for the tag.
   *  Used to allow screen reader to read tag as ariaLabel content instead of the label content */
  ariaLabel?: string;
}

const Tag: React.FunctionComponent<TagProps> = ({
  label,
  tooltipContent,
  tooltipId,
  ariaLabel,
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
      </div>
    </LabelOverlayTrigger>
  );
};

export default Tag;
