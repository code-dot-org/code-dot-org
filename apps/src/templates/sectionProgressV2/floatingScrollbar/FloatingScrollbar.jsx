import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './floating-scrollbar.module.scss';
import {scrollbarWidth} from './scrollbarUtils';
/**
 * A component that adds a horizontal scrollbar to the bottom of {children} element.
 * Scrollbar will appear at the bottom of {child} if the bottom is visible.
 * Scrollbar will at the bottom of the screen if the bottom of {child} is not visible.
 *
 * {children} must be a single element and not a list of elements.
 * childRef - a ref to {child} element.
 *    Set by calling `ref={childRef}` on the {child} element
 */
export default function FloatingScrollbar({children, childRef}) {
  const scrollRef = React.useRef();
  const childContainerRef = React.useRef();

  const [childScrollWidth, setChildScrollWidth] = React.useState(0);
  const [childWidth, setChildWidth] = React.useState(0);
  const [childHeight, setChildHeight] = React.useState(0);
  const [scrollVisible, setScrollVisible] = React.useState(true);

  const childContainerResizeObserver = React.useMemo(
    () =>
      new ResizeObserver(([entry]) => {
        if (entry.borderBoxSize) {
          setChildWidth(entry.borderBoxSize[0].inlineSize);
        }
      }),
    [setChildWidth]
  );

  const childContentsResizeObserver = React.useMemo(
    () =>
      new ResizeObserver(([entry]) => {
        if (entry.borderBoxSize) {
          setChildScrollWidth(entry.borderBoxSize[0].inlineSize + 1);
          setChildHeight(entry.borderBoxSize[0].blockSize);
        }
      }),
    [setChildScrollWidth]
  );

  React.useEffect(() => {
    if (childContainerResizeObserver) {
      childContainerResizeObserver.observe(childContainerRef.current);
    }
    if (childContentsResizeObserver) {
      childContentsResizeObserver.observe(childRef.current);
    }
    return () => {
      childContainerResizeObserver.disconnect();
      childContentsResizeObserver.disconnect();
    };
  }, [
    childContainerResizeObserver,
    childContentsResizeObserver,
    childContainerRef,
    childRef,
  ]);

  const handleScrollAndResize = React.useCallback(() => {
    const maxVisibleY =
      window.innerHeight || document.documentElement.clientHeight;

    // 20 is the height of the scrollbar.
    const isNowVisible =
      childContainerRef?.current.getBoundingClientRect().bottom + 20 <
      maxVisibleY;

    if (isNowVisible !== scrollVisible) {
      setScrollVisible(isNowVisible);
    }
  }, [childContainerRef, scrollVisible, setScrollVisible]);

  React.useEffect(() => {
    window.addEventListener('scroll', () => handleScrollAndResize());
    window.addEventListener('resize', () => handleScrollAndResize());
    // Call it on initial render to set the initial state
    handleScrollAndResize();

    return () => {
      // return a cleanup function to unregister our function since it will run multiple times
      window.removeEventListener('scroll', e => handleScrollAndResize(e));
      window.removeEventListener('resize', e => handleScrollAndResize(e));
    };
  }, [handleScrollAndResize]);

  const scrollChild = React.useCallback(
    scroll => {
      if (childContainerRef?.current) {
        childContainerRef.current.scrollLeft = scroll.target.scrollLeft;
      }
    },
    [childContainerRef]
  );

  if (children.length > 1) {
    throw new Error('FloatingScrollbar only supports a single child');
  } else if (children.length === 0) {
    return null;
  }

  return (
    <div className={styles.scrollingContainer}>
      <div
        className={styles.scrollingContent}
        ref={childContainerRef}
        onScroll={scroll => {
          scrollRef.current.scrollLeft = scroll.target.scrollLeft;
        }}
      >
        {children}
      </div>
      <div
        className={classNames(
          styles.scrollBar,
          !scrollVisible && styles.bottomScrollBar
        )}
        onScroll={scrollChild}
        ref={scrollRef}
        style={{width: childWidth + 'px', height: scrollbarWidth + 'px'}}
      >
        <div
          style={{width: childScrollWidth + 'px'}}
          className={styles.emptyScrollContents}
        />
      </div>
    </div>
  );
}

FloatingScrollbar.propTypes = {
  children: PropTypes.element.isRequired,
  childRef: PropTypes.object.isRequired,
};
