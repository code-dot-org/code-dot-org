import classNames from 'classnames';
import {
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import moduleStyles from './scrollFade.module.scss';

export type ScrollFadeEdge = 'top' | 'right' | 'bottom' | 'left';

const ALL_EDGES: ScrollFadeEdge[] = ['top', 'right', 'bottom', 'left'];
const DEFAULT_EDGES: ScrollFadeEdge[] = ['top', 'bottom'];

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, summary, iframe, audio[controls], video[controls], [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"])';

export interface ScrollFadeProps extends HTMLAttributes<HTMLDivElement> {
  /** Content of the scrolling area. */
  children: ReactNode;
  /**
   * Edges that fade while there is more content past them. Physical edges:
   * `left` is the left edge in RTL too. Top or bottom makes the area scroll
   * vertically; left or right, horizontally.
   */
  edges?: ScrollFadeEdge[];
  /** Length of each fade: a number in px, or any CSS length or percentage. */
  fadeSize?: number | string;
  /**
   * Attributes for the scrolling element. Give it an `aria-label` or
   * `aria-labelledby`: when it becomes a tab stop it is then announced as a
   * named region.
   */
  scrollerProps?: HTMLAttributes<HTMLDivElement>;
}

/**
 * ### Production-ready Checklist:
 * * (✘) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/ScrollFade.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: ScrollFade Component.
 * A scrolling area whose edges fade while there is more content past them.
 * Give it a size, or a flex or grid slot, so its content can overflow. The
 * ref is the scrolling element. When it overflows and has no focusable
 * content, it becomes a tab stop so keyboard users can scroll it.
 */
const ScrollFade = forwardRef<HTMLDivElement, ScrollFadeProps>(
  (
    {
      children,
      edges = DEFAULT_EDGES,
      fadeSize = 24,
      className,
      scrollerProps,
      style,
      ...rootProps
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => scrollerRef.current as HTMLDivElement, []);
    // Chrome and Firefox already make such a scroller focusable, but Safari
    // does not, and none of them name it.
    const [needsFocus, setNeedsFocus] = useState(false);

    const activeEdges = ALL_EDGES.filter(edge => edges.includes(edge));
    const edgeKey = activeEdges.join(' ');
    const vertical =
      activeEdges.includes('top') || activeEdges.includes('bottom');
    const horizontal =
      activeEdges.includes('left') || activeEdges.includes('right');
    const named = Boolean(
      scrollerProps?.['aria-label'] || scrollerProps?.['aria-labelledby'],
    );
    const ownsTabIndex = scrollerProps?.tabIndex === undefined;

    useEffect(() => {
      if (needsFocus && ownsTabIndex && !named) {
        console.warn(
          'ScrollFade: an overflowing scroller became a tab stop with no name. Give it an aria-label or aria-labelledby through scrollerProps.',
        );
      }
    }, [needsFocus, ownsTabIndex, named]);

    useEffect(() => {
      const root = rootRef.current;
      const scroller = scrollerRef.current;
      if (!root || !scroller) {
        return;
      }
      const active = edgeKey.split(' ');
      let rtl = false;
      let overflows = false;

      // Written to the DOM rather than state, so scrolling doesn't re-render.
      const updateFades = () => {
        const maxY = scroller.scrollHeight - scroller.clientHeight;
        const maxX = scroller.scrollWidth - scroller.clientWidth;
        const y = scroller.scrollTop;
        // RTL scrollLeft runs from 0 at the right edge down to -maxX.
        const x = rtl ? maxX + scroller.scrollLeft : scroller.scrollLeft;
        // 1px slack absorbs subpixel scroll positions.
        const past = {
          top: y > 1,
          bottom: maxY - y > 1,
          left: x > 1,
          right: maxX - x > 1,
        };
        ALL_EDGES.forEach(edge =>
          root.toggleAttribute(
            `data-fade-${edge}`,
            active.includes(edge) && past[edge],
          ),
        );
      };

      const updateFocus = () =>
        setNeedsFocus(overflows && !scroller.querySelector(FOCUSABLE_SELECTOR));

      const measure = () => {
        rtl = getComputedStyle(scroller).direction === 'rtl';
        // Border plus scrollbar on each side; the fades stop short of both.
        const left = scroller.clientLeft;
        const right = scroller.offsetWidth - scroller.clientWidth - left;
        const bottom =
          scroller.offsetHeight - scroller.clientHeight - scroller.clientTop;
        root.style.setProperty('--scroll-fade-inset-left', `${left}px`);
        root.style.setProperty('--scroll-fade-inset-right', `${right}px`);
        root.style.setProperty('--scroll-fade-inset-bottom', `${bottom}px`);
        overflows =
          scroller.scrollHeight - scroller.clientHeight > 1 ||
          scroller.scrollWidth - scroller.clientWidth > 1;
        updateFocus();
        updateFades();
      };

      // Content can grow without the scroller's own box changing, so watch
      // the children too.
      const resizeObserver = new ResizeObserver(measure);
      const observeChildren = () => {
        resizeObserver.disconnect();
        resizeObserver.observe(scroller);
        Array.from(scroller.children).forEach(child =>
          resizeObserver.observe(child),
        );
      };
      // Subtree: focusable content can arrive anywhere below the scroller.
      const mutationObserver = new MutationObserver(records => {
        if (
          records.some(r => r.type === 'childList' && r.target === scroller)
        ) {
          observeChildren();
        }
        updateFocus();
      });
      mutationObserver.observe(scroller, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['tabindex', 'href', 'contenteditable', 'controls'],
      });
      observeChildren();
      measure();
      scroller.addEventListener('scroll', updateFades, {passive: true});

      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        scroller.removeEventListener('scroll', updateFades);
      };
    }, [edgeKey]);

    return (
      <div
        ref={rootRef}
        className={classNames(moduleStyles.scrollFade, className)}
        style={
          {
            '--scroll-fade-size':
              typeof fadeSize === 'number' ? `${fadeSize}px` : fadeSize,
            ...style,
          } as CSSProperties
        }
        {...rootProps}
      >
        <div
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so a keyboard can scroll it
          tabIndex={needsFocus ? 0 : undefined}
          role={needsFocus && named ? 'region' : undefined}
          {...scrollerProps}
          ref={scrollerRef}
          className={classNames(
            moduleStyles.scroller,
            vertical && moduleStyles.scrollY,
            horizontal && moduleStyles.scrollX,
            scrollerProps?.className,
          )}
        >
          {children}
        </div>
      </div>
    );
  },
);

ScrollFade.displayName = 'ScrollFade';

export default ScrollFade;
