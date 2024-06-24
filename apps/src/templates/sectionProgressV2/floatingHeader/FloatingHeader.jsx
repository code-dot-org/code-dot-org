import PropTypes from 'prop-types';
import React from 'react';

import styles from './floating-header.module.scss';

/** A component that displays prop {header} at the top of
 * {child}. This header will float at the top of the screen
 * when the top of {child} is not visible.
 *
 * {child} must be a single element and not a list of elements.
 *  {child} should have all content visible and not itself scrollable.
 * childRef - a ref to {child} element.
 *   Set by calling `ref={childRef}` on the {child} element
 * header - the element to float at the top of the screen
 * {header} should have all content visible and not itself scrollable.
 */

export default function FloatingHeader({header, children, childRef}) {
  const headerRef = React.useRef();
  const childContainerRef = React.useRef();

  const [floatHeader, setFloatHeader] = React.useState(false);

  const handleScrollAndResize = React.useCallback(() => {
    const maxVisibleY =
      window.innerHeight || document.documentElement.clientHeight;

    const isTableTopVisible =
      childContainerRef?.current.getBoundingClientRect().top > 0;
    // Hide scrollbar if top is below screen or bottom is above screen.
    const isTableOffScreen =
      childContainerRef?.current.getBoundingClientRect().top > maxVisibleY ||
      childContainerRef?.current.getBoundingClientRect().bottom < 0;

    const shouldFloatHeader = !isTableTopVisible && !isTableOffScreen;

    if (shouldFloatHeader !== floatHeader) {
      setFloatHeader(shouldFloatHeader);
      console.log({
        label: 'lfm',
        shouldFloatHeader: shouldFloatHeader,
        floatHeader: floatHeader,
        isTableOffScreen: isTableOffScreen,
        isTableTopVisible: isTableTopVisible,
      });
    }
  }, [childContainerRef, floatHeader, setFloatHeader]);

  React.useEffect(() => {
    window.addEventListener('scroll', handleScrollAndResize);
    window.addEventListener('resize', handleScrollAndResize);
    // Call it on initial render to set the initial state
    handleScrollAndResize();

    return () => {
      // return a cleanup function to unregister our function since it will run multiple times
      window.removeEventListener('scroll', handleScrollAndResize);
      window.removeEventListener('resize', handleScrollAndResize);
    };
  }, [handleScrollAndResize]);

  return (
    <div className={styles.floatingHeader}>
      <div className={floatHeader && styles.floatHeader} ref={headerRef}>
        {header}
      </div>
      <div className={styles.childContainer} ref={childContainerRef}>
        <div className={styles.child}>{children}</div>
      </div>
    </div>
  );
}

FloatingHeader.propTypes = {
  header: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  childRef: PropTypes.object.isRequired,
};
