import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useState} from 'react';

import styles from './back-to-top.module.scss';

export const BACK_TO_TOP_SCROLL_THRESHOLD_PX = 400;

export interface BackToTopProps {
  scrollContainerRef: React.RefObject<HTMLElement>;
  // The tab unmounts once the scroll reaches the top, so focus moves here
  // rather than being dropped to the document body.
  focusTargetRef?: React.RefObject<HTMLElement>;
}

const BackToTop: React.FunctionComponent<BackToTopProps> = ({
  scrollContainerRef,
  focusTargetRef,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }
    const updateVisibility = () =>
      setIsVisible(scrollContainer.scrollTop > BACK_TO_TOP_SCROLL_THRESHOLD_PX);
    updateVisibility();
    scrollContainer.addEventListener('scroll', updateVisibility, {
      passive: true,
    });
    return () =>
      scrollContainer.removeEventListener('scroll', updateVisibility);
  }, [scrollContainerRef]);

  if (!isVisible) {
    return null;
  }

  const handleClick = () => {
    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
    focusTargetRef?.current?.focus({preventScroll: true});
  };

  return (
    <div className={styles.backToTop}>
      <MuiButton
        variant="text"
        color="secondary"
        size="extraSmall"
        type="button"
        startIcon={
          <FontAwesomeV6Icon iconName="circle-chevron-up" iconStyle="solid" />
        }
        onClick={handleClick}
      >
        Back to top
      </MuiButton>
    </div>
  );
};

export default BackToTop;
