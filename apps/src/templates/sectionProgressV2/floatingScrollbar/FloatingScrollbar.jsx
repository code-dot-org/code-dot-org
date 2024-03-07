import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './floating-scrollbar.module.scss';

/**
 * A component that adds a horizontal scrollbar to the bottom of {children} element.
 * Scrollbar will appear at the bottom of {child} if the bottom is visible.
 * Scrollbar will at the bottom of the screen if the bottom of {child} is not visible.
 *
 * {children} must:
 *    be a single element
 *    be a container with overflow-x: hidden
 *    have a single contents component that you would like to horizontally scroll
 * setOnScroll - a function that will be called with an onScroll event.
 *    This should be added to {child} element as the `onScroll` prop
 * childContainerRef - a ref to {child} element.
 *    Set by calling `ref={childContainerRef}` on the {child} element
 * childContentsRef - a ref to the contents of {child} element.
 *    Set by calling `ref={childContentsRef}` on the contents of {child} element
 */
export default function FloatingScrollbar({
  children,
  setOnScroll,
  childContainerRef,
  childContentsRef,
}) {
  const scrollRef = React.useRef();

  const [childScrollWidth, setChildScrollWidth] = React.useState(0);
  const [childWidth, setChildWidth] = React.useState(0);
  const [scrollVisible, setScrollVisible] = React.useState(true);

  if (children.length > 1) {
    throw new Error('FloatingScrollbar only supports a single child');
  }

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
    if (childContainerResizeObserver) {
      childContainerResizeObserver.observe(childContainerRef.current);
    }
    if (childContentsResizeObserver) {
      childContentsResizeObserver.observe(childContentsRef.current);
    }
    return () => {
      childContainerResizeObserver.disconnect();
      childContentsResizeObserver.disconnect();
    };
  }, [
    childContainerResizeObserver,
    childContentsResizeObserver,
    childContainerRef,
    childContentsRef,
  ]);

  const handleScroll = React.useCallback(() => {
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
    window.addEventListener('scroll', e => handleScroll(e));

    return () => {
      // return a cleanup function to unregister our function since it will run multiple times
      window.removeEventListener('scroll', e => handleScroll(e));
    };
  }, [handleScroll]);

  const scrollChild = React.useCallback(
    scroll => {
      if (childContainerRef?.current) {
        childContainerRef.current.scrollLeft = scroll.target.scrollLeft;
      }
    },
    [childContainerRef]
  );

  React.useEffect(() => {
    setOnScroll(() => scroll => {
      scrollRef.current.scrollLeft = scroll.target.scrollLeft;
    });
  }, [setOnScroll, scrollRef]);

  return (
    <div className={styles.scrollingContainer}>
      {children}
      <div
        className={classNames(
          styles.scrollBar,
          !scrollVisible && styles.bottomScrollBar
        )}
        onScroll={scrollChild}
        ref={scrollRef}
        style={{width: childWidth + 'px'}}
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
  setOnScroll: PropTypes.func.isRequired,
  childContainerRef: PropTypes.object.isRequired,
  childContentsRef: PropTypes.object.isRequired,
};
