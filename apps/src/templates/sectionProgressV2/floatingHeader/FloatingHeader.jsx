import PropTypes from 'prop-types';
import React from 'react';

import styles from './floating-header.module.scss';

/** A component that displays prop {header} at the top of
 * {child}. This header will float at the top of the screen
 * when the top of {child} is not visible.
 *
 * {child} must be a single element and not a list of elements.
 *  {child} should have all content visible and not itself scrollable.
 * header - the element to float at the top of the screen
 * {header} should have all content visible and not itself scrollable.
 */

export default function FloatingHeader({header, children, tableRef, id}) {
  const headerRef = React.useRef();
  const childContainerRef = React.useRef();

  const [floatHeader, setFloatHeader] = React.useState(false);
  const [floatXPosition, setFloatXPosition] = React.useState(0);

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
      if (id === 5186) {
        console.log({
          label: 'lfm',
          id: id,
          columnLeft1: childContainerRef?.current.getBoundingClientRect().left,
          tableLeft: tableRef?.current.getBoundingClientRect().left,
          // headerLeft: headerRef?.current.getBoundingClientRect().left,
        });
      }
    }

    setFloatXPosition(childContainerRef?.current.getBoundingClientRect().left);
  }, [childContainerRef, floatHeader, setFloatHeader, id, tableRef]);

  React.useEffect(() => {
    window.addEventListener('scroll', handleScrollAndResize);
    window.addEventListener('resize', handleScrollAndResize);
    // tableRef.addEventListener('scroll', handleScrollAndResize);
    // Call it on initial render to set the initial state
    handleScrollAndResize();

    return () => {
      // return a cleanup function to unregister our function since it will run multiple times
      window.removeEventListener('scroll', handleScrollAndResize);
      window.removeEventListener('resize', handleScrollAndResize);
    };
  }, [handleScrollAndResize, tableRef]);

  return (
    <div className={styles.floatingHeader}>
      {(!floatHeader ||
        (floatXPosition >= tableRef?.current.getBoundingClientRect().left &&
          floatXPosition <
            tableRef?.current.getBoundingClientRect().right)) && (
        <div
          className={floatHeader && styles.floatHeader}
          ref={headerRef}
          style={{left: floatXPosition + 'px'}}
        >
          {header}
        </div>
      )}
      <div className={styles.childContainer} ref={childContainerRef}>
        <div className={styles.child}>{children}</div>
      </div>
    </div>
  );
}

FloatingHeader.propTypes = {
  header: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  tableRef: PropTypes.object,
  id: PropTypes.number,
};
