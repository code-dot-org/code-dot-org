import {
  OverlayTrigger,
  Tooltip,
  TooltipProps,
  OverlayTriggerProps,
} from 'react-bootstrap-2'; // TODO: Once we have [DSCO] Tooltip component, replace this import with it

import React from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from './tags.module.scss';

// The arrowProps passed down in ReactBootstrap use styles that
// conflict with the custom styles that we want, so they
// are extracted out here.
const LabelTooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({arrowProps, ...props}, ref: React.Ref<HTMLDivElement>) => (
    <Tooltip ref={ref} {...props} />
  )
);

// Allow the tooltips to display on focus so that the information
// can be shown via keyboard
const LabelOverlayTrigger: React.FC<OverlayTriggerProps> = props => (
  <OverlayTrigger placement="top" trigger={['hover', 'focus']} {...props} />
);

export interface TagsProps {
  /** Array of tags to be rendered */
  tagsList: string[];
  /** Whether we style the tags as disabled or not */
  styleAsDisabled?: boolean;
  /** Size of button */
  size?: Exclude<ComponentSizeXSToL, 'xs'>;
}

// TODO:
// - connect icons
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
}) => {
  return (
    <div
      className={classNames(moduleStyles.tags, moduleStyles[`tags-${size}`])}
      data-testid="tags"
    >
      {tagsList.length > 0 && (
        <LabelOverlayTrigger
          overlay={(props: TooltipProps) => (
            <LabelTooltip
              id="first-label-tooltip"
              className={moduleStyles.tagTooltip}
              {...props}
            >
              {tagsList[0]}
            </LabelTooltip>
          )}
        >
          <div
            tabIndex={0}
            role="tooltip"
            className={classNames(styleAsDisabled && moduleStyles.disabledTag)}
          >
            {tagsList[0]}
          </div>
        </LabelOverlayTrigger>
      )}
      {tagsList.length > 1 && (
        <LabelOverlayTrigger
          overlay={props => (
            <LabelTooltip
              id="remaining-labels-tooltip"
              className={moduleStyles.tagTooltip}
              {...props}
            >
              {tagsList.slice(1).map(label => (
                <p key={label}>{label}</p>
              ))}
            </LabelTooltip>
          )}
        >
          <div
            tabIndex={0}
            role="tooltip"
            className={classNames(styleAsDisabled && moduleStyles.disabledTag)}
            aria-label={tagsList.slice(1).join(', ')}
          >{`+${tagsList.length - 1}`}</div>
        </LabelOverlayTrigger>
      )}
    </div>
  );
};

export default Tags;
