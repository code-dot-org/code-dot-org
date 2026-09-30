import classNames from 'classnames';
import type {FunctionComponent, PropsWithChildren, Ref} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './guide.module.scss';

/** The guide's distances from its container's right and bottom edges
    (.guide in guide.module.scss), for siblings that lay out around it. */
export const GUIDE_RIGHT_OFFSET_PX = 32;
export const GUIDE_BOTTOM_OFFSET_PX = 20;

export interface GuideProps extends PropsWithChildren {
  id?: string;
  /** A named share of the container, or a fixed width in px. A change
      animates. */
  width?: 'normal' | 'narrow' | 'very-narrow' | number;
  position?: 'normal' | 'bottom';
  modal?: 'full' | 'gap';
  cornerIcon?: 'minimize' | 'maximize';
  onCornerIconClick?: () => void;
  /** Shrink-wrap whatever is left showing, e.g. a single button. */
  collapsed?: boolean;
  /** The floating panel itself, for a caller that measures it. */
  panelRef?: Ref<HTMLDivElement>;
}

// The Guide is a floating container for instructional content.  It is larger
// and more prominent than our more traditional instructions.  It's named
// for the Guide used for instructions in AI for Oceans.
const Guide: FunctionComponent<GuideProps> = ({
  id,
  children,
  width,
  position,
  modal,
  cornerIcon,
  onCornerIconClick,
  collapsed,
  panelRef,
}) => {
  return (
    <div
      id={id ? `${id}-container` : undefined}
      className={classNames(
        modal && styles.guideContainerModal,
        modal === 'gap' && styles.guideContainerModalGap,
      )}
    >
      <div
        id={id}
        ref={panelRef}
        // A collapsed panel is only as wide as its buttons, so a fixed width
        // applies only while it is open.
        style={typeof width === 'number' && !collapsed ? {width} : undefined}
        className={classNames(
          styles.guide,
          typeof width === 'number'
            ? undefined
            : width === 'very-narrow'
              ? styles.guideVeryNarrowWidth
              : width === 'narrow'
                ? styles.guideNarrowWidth
                : styles.guideNormalWidth,
          position === 'bottom'
            ? styles.guideBottomPosition
            : styles.guideNormalPosition,
          modal === 'gap' && styles.guideGap,
          collapsed && styles.guideCollapsed,
        )}
      >
        {children}
        {cornerIcon && onCornerIconClick && (
          <button
            type="button"
            className={styles.cornerIconButton}
            onClick={onCornerIconClick}
            aria-label={
              cornerIcon === 'minimize' ? 'Minimize guide' : 'Restore guide'
            }
          >
            <FontAwesomeV6Icon
              iconName={cornerIcon === 'minimize' ? 'caret-down' : 'caret-up'}
              iconStyle="solid"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default Guide;
