import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import {scrollbarWidth} from './scrollbarUtils';

import styles from './floating-scrollbar.module.scss';
/**
 * A component that adds a horizontal scrollbar to the bottom of {children} element.
 * Scrollbar will appear at the bottom of {child} if the bottom is visible.
 * Scrollbar will at the bottom of the screen if the bottom of {child} is not visible.
 *
 * {children} must be a single element and not a list of elements.
 *   {child} should have all content visible and not itself scrollable.
 * childRef - a ref to {child} element.
 *    Set by calling `ref={childRef}` on the {child} element
 * {scrollCallback} - a function that is called whenever the container is scrolled.
 */
export default function FloatingScrollbar({
  children,
  childRef,
  scrollCallback,
}) {
  const scrollRef = React.useRef();
  const childContainerRef = React.useRef();

  const [childScrollWidth, setChildScrollWidth] = React.useState(1);
  const [childWidth, setChildWidth] = React.useState(1);
  const [floatScrollbar, setFloatScrollbar] = React.useState(true);

  const canFloat = React.useMemo(() => {
    const newCanFloat = childScrollWidth > 0 && childWidth > 0;
    if (!newCanFloat) {
      console.warn('FloatingScrollbar: Unable to calculate widths', {
        childScrollWidth,
        childWidth,
      });
    }
    return newCanFloat;
  }, [childScrollWidth, childWidth]);

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
        }
      }),
    [setChildScrollWidth]
  );

  React.useEffect(() => {
    if (childContainerResizeObserver && childContainerRef?.current) {
      childContainerResizeObserver.observe(childContainerRef.current);
    }
    if (childContentsResizeObserver && childRef?.current) {
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

    const isTableBottomVisible =
      childContainerRef?.current.getBoundingClientRect().bottom +
        scrollbarWidth <
      maxVisibleY;
    // Hide scrollbar if top is below screen or bottom is above screen.
    const isTableOffScreen =
      childContainerRef?.current.getBoundingClientRect().top > maxVisibleY ||
      childContainerRef?.current.getBoundingClientRect().bottom < 0;

    const shouldFloatScrollbar = !isTableBottomVisible && !isTableOffScreen;
    if (shouldFloatScrollbar !== floatScrollbar) {
      setFloatScrollbar(shouldFloatScrollbar);
    }
  }, [childContainerRef, floatScrollbar, setFloatScrollbar]);

  React.useEffect(() => {
    if (canFloat) {
      window.addEventListener('scroll', handleScrollAndResize);
      window.addEventListener('resize', handleScrollAndResize);
      // Call it on initial render to set the initial state
      handleScrollAndResize();

      return () => {
        // return a cleanup function to unregister our function since it will run multiple times
        window.removeEventListener('scroll', handleScrollAndResize);
        window.removeEventListener('resize', handleScrollAndResize);
      };
    }
  }, [handleScrollAndResize, canFloat]);

  const scrollChild = React.useCallback(
    scroll => {
      if (childContainerRef?.current) {
        childContainerRef.current.scrollLeft = scroll.target.scrollLeft;

        if (scrollCallback) {
          scrollCallback(scroll);
        }
      }
    },
    [childContainerRef, scrollCallback]
  );

  if (children.length > 1) {
    throw new Error('FloatingScrollbar only supports a single child');
  } else if (children.length === 0) {
    return null;
  } else if (!canFloat) {
    // if we can't calculate the widths we can't float the scrollbar
    // Instead we should show the children with the default non-floating scrollbar
    return (
      <div className={styles.defaultScroll} ref={childContainerRef}>
        {children}
      </div>
    );
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
          floatScrollbar && styles.bottomScrollBar
        )}
        onScroll={scrollChild}
        ref={scrollRef}
        style={{width: childWidth + 'px', height: 1 + scrollbarWidth + 'px'}}
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
  scrollCallback: PropTypes.func,
};
