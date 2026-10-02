import classNames from 'classnames';
import type {FunctionComponent, PropsWithChildren} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './guide.module.scss';

export interface GuideProps extends PropsWithChildren {
  id?: string;
  width?: 'normal' | 'narrow' | 'very-narrow';
  position?: 'normal' | 'bottom';
  modal?: 'full' | 'gap';
  cornerIcon?: 'minimize' | 'maximize';
  onCornerIconClick?: () => void;
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
