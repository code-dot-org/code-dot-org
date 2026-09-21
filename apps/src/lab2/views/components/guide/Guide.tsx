import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import styles from './Guide.module.scss';

/** The guide's distances from its container's right and bottom edges
    (.guide in Guide.module.scss), for siblings that lay out around it. */
export const GUIDE_RIGHT_OFFSET_PX = 32;
export const GUIDE_BOTTOM_OFFSET_PX = 20;

interface GuideProps {
  id?: string;
  children: React.ReactNode;
  /** A named share of the container, or a fixed width in px. A change
      animates (the panel transitions its width). */
  width?: 'normal' | 'narrow' | 'very-narrow' | number;
  position?: 'normal' | 'bottom';
  modal?: 'full' | 'gap';
  cornerIcon?: 'minimize' | 'maximize';
  /** Shrink-wrap whatever is left showing, e.g. a single button. */
  collapsed?: boolean;
  onCornerIconClick?: () => void;
  /** The floating panel itself, for a caller that measures it. */
  panelRef?: React.Ref<HTMLDivElement>;
}

// A floating container for instructional content, larger and more prominent
// than our traditional instructions.  Named for the Guide in AI for Oceans.
const Guide: React.FunctionComponent<GuideProps> = ({
  id,
  children,
  width,
  position,
  modal,
  cornerIcon,
  collapsed,
  onCornerIconClick,
  panelRef,
}) => {
  return (
    <div
      id={id ? `${id}-container` : undefined}
      className={classNames(
        modal && styles.guideContainerModal,
        modal === 'gap' && styles.guideContainerModalGap
      )}
    >
      <div
        id={id}
        ref={panelRef}
        // Collapsed shrink-wraps its controls; a fixed width yields to that.
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
          collapsed && styles.guideCollapsed
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
