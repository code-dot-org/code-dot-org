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
  onCornerIcon?: () => void;
}

// The Guide is a floating container for instructional content.  It is larger
// and more prominent than our more traditional instructions.  It's named
// for the Guide used for instructions in AI for Oceans.
const Guide: React.FunctionComponent<GuideProps> = ({
  id,
  children,
  width,
  position,
  modal,
  cornerIcon,
  onCornerIcon,
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
          modal === 'gap' && styles.guideGap
        )}
      >
        {children}
        {cornerIcon && onCornerIcon && (
          <button
            type="button"
            className={styles.cornerIconButton}
            onClick={onCornerIcon}
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
