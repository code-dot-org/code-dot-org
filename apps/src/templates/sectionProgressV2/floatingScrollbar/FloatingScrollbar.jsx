import React from 'react';
import classNames from 'classnames';
import styles from './floating-scrollbar.module.scss';

export default function FloatingScrollbar({children, setOnScroll, childRef}) {
  const scrollRef = React.useRef();

  const [childScrollWidth, setChildScrollWidth] = React.useState(0);
  const [childWidth, setChildWidth] = React.useState(0);
  const [scrollVisible, setScrollVisible] = React.useState(true);

  if (!!childRef.current) {
    if (childScrollWidth !== childRef.current.scrollWidth) {
      setChildScrollWidth(childRef.current.scrollWidth);
    }
    if (childWidth !== childRef.current.offsetWidth) {
      setChildWidth(childRef.current.offsetWidth);
    }
  }

  const handleScroll = React.useCallback(() => {
    const maxVisibleY =
      window.innerHeight || document.documentElement.clientHeight;

    const isNowVisible =
      childRef.current?.getBoundingClientRect().bottom < maxVisibleY;

    if (isNowVisible !== scrollVisible) {
      setScrollVisible(isNowVisible);
    }
  }, [scrollVisible, setScrollVisible]);

  React.useEffect(() => {
    window.addEventListener('scroll', e => handleScroll(e));

    return () => {
      // return a cleanup function to unregister our function since it will run multiple times
      window.removeEventListener('scroll', e => handleScroll(e));
    };
  }, [handleScroll]);

  const scrollChild = React.useCallback(scroll => {
    childRef.current.scrollLeft = scroll.target.scrollLeft;
  });

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
