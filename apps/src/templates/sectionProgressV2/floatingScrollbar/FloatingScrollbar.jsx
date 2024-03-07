import React from 'react';
import classNames from 'classnames';
import styles from './floating-scrollbar.module.scss';

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

  const childContainerResizeObserver = React.useMemo(
    () =>
      new ResizeObserver(entries => {
        for (let entry of entries) {
          console.log('lfm', entry);
          if (entry.borderBoxSize) {
            console.log('entry.borderBoxSize', entry.borderBoxSize);
            setChildWidth(entry.borderBoxSize[0].inlineSize);
          }
        }
      }),
    [setChildWidth]
  );

  const childContentsResizeObserver = React.useMemo(
    () =>
      new ResizeObserver(entries => {
        for (let entry of entries) {
          console.log('lfm1', entry);
          if (entry.borderBoxSize) {
            console.log('entry.contentBoxSize', entry.contentBoxSize);
            setChildScrollWidth(entry.borderBoxSize[0].inlineSize);
          }
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
  }, [
    childContainerResizeObserver,
    childContentsResizeObserver,
    childContainerRef,
    childContentsRef,
  ]);

  // React.useEffect(() => {
  //   console.log('childNode changed');
  //   if (childScrollWidth !== childNode?.scrollWidth) {
  //     console.log('childScrollWidth changed', childNode?.scrollWidth);
  //     setChildScrollWidth(childNode?.scrollWidth);
  //   }
  //   if (childWidth !== childNode?.offsetWidth) {
  //     console.log('childWidth changed', childNode?.offsetWidth);
  //     setChildWidth(childNode?.offsetWidth);
  //   }
  // }, [childNode]);

  const handleScroll = React.useCallback(() => {
    const maxVisibleY =
      window.innerHeight || document.documentElement.clientHeight;

    const isNowVisible =
      childContainerRef?.current.getBoundingClientRect().bottom < maxVisibleY;

    if (isNowVisible !== scrollVisible) {
      setScrollVisible(isNowVisible);
    }
  }, [childContainerRef, scrollVisible, setScrollVisible]);

  React.useEffect(() => {
    // TODO - switch this to an IntersectionObserver
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
        <div style={{width: childScrollWidth + 'px'}} />
      </div>
    </div>
  );
}
