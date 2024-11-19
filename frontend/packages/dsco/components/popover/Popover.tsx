import classnames from 'classnames';
import React, {ReactNode} from 'react';

import CloseButton from '@cdo/apps/componentLibrary/closeButton';
import {
  ComponentPlacementDirection,
  ComponentSizeXSToL,
} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {BodyTwoText, Heading5} from '@cdo/apps/componentLibrary/typography';

import moduleStyles from './popover.module.scss';

export interface PopoverProps {
  /** Popover title */
  title: string;
  /** Popover direction/position relative to connected element */
  direction?: ComponentPlacementDirection | 'none';
  /** Popover icon */
  icon?: FontAwesomeV6IconProps;
  /** Popover image */
  image?: {
    src: string;
    alt: string;
  };
  /** Popover content text*/
  content: string;
  /** Popover function to close the popover */
  onClose: () => void;
  /** Custom className */
  className?: string;
  /** Popover custom styles (used for positioning the popover on the go) */
  style?: React.CSSProperties;
  size?: Exclude<ComponentSizeXSToL, 'l' | 's' | 'xs'>;
  /** Popover buttons */
  buttons?: ReactNode;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/PopoverTest.jsx, apps/test/unit/componentLibrary/WithPopoverTest.jsx);
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready For Dev```
 *
 * Design System: Popover Component.
 * Can be used to render a Popover.
 */
const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      icon,
      image,
      title,
      content,
      buttons,
      direction = 'onTop',
      onClose,
      className,
      size = 'm',
      style = {},
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={classnames(
          moduleStyles.popover,
          image && moduleStyles['popover-withImage'],
          moduleStyles[`popover-${direction}`],
          moduleStyles[`popover-${size}`],
          className
        )}
        style={style}
      >
        <CloseButton
          className={moduleStyles.closeButton}
          onClick={onClose}
          size="l"
          aria-label="Close"
        />
        {image && (
          <div className={moduleStyles.imageSection}>
            <img src={image.src} alt={image.alt} />
          </div>
        )}

        <div className={moduleStyles.informationalSection}>
          {icon && (
            <div className={moduleStyles.iconSection}>
              <FontAwesomeV6Icon {...icon} />
            </div>
          )}
          <div className={moduleStyles.contentSection}>
            <div className={moduleStyles.textSection}>
              <Heading5>{title}</Heading5>
              <BodyTwoText>{content}</BodyTwoText>
            </div>
            {buttons && (
              <div className={moduleStyles.buttonsSection}>{buttons}</div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default Popover;
