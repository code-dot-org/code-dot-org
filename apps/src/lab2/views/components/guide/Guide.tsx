import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import styles from './Guide.module.scss';

interface GuideProps {
  id?: string;
  children: React.ReactNode;
  width?: 'normal' | 'narrow' | 'very-narrow';
  position?: 'normal' | 'bottom';
  modal?: 'full' | 'gap';
  cornerIcon?: 'minimize' | 'maximize';
  /** Shrink-wrap whatever is left showing, e.g. a single button. */
  collapsed?: boolean;
  onCornerIconClick?: () => void;
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
        className={classNames(
          styles.guide,
          width === 'very-narrow'
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
