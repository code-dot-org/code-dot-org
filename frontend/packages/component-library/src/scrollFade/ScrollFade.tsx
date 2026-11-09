import classNames from 'classnames';
import {
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import moduleStyles from './scrollFade.module.scss';

export type ScrollFadeEdge = 'top' | 'right' | 'bottom' | 'left';

const ALL_EDGES: ScrollFadeEdge[] = ['top', 'right', 'bottom', 'left'];
const DEFAULT_EDGES: ScrollFadeEdge[] = ['top', 'bottom'];

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, summary, iframe, audio[controls], video[controls], [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"])';

// Writes only on change: the mutation observer below watches tabindex, and
// even a same-value write would queue a record and loop.
function setAttribute(el: Element, name: string, value: string | null) {
  if (el.getAttribute(name) === value) {
    return;
  }
  if (value === null) {
    el.removeAttribute(name);
  } else {
    el.setAttribute(name, value);
  }
}

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
   * The content fades out over whatever is behind it. Set a color to fade
   * into that color instead, painted behind the content at each edge.
   */
  fadeColor?: string;
  /** Class name for the scrolling element, which holds the children. */
  scrollerClassName?: string;
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
      fadeColor,
      className,
      scrollerClassName,
      scrollerProps,
      style,
      ...rootProps
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const setScrollerRef = useCallback(
      (node: HTMLDivElement | null) => {
        scrollerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const edgeKey = ALL_EDGES.filter(edge => edges.includes(edge)).join(' ');
    const vertical = edgeKey.includes('top') || edgeKey.includes('bottom');
    const horizontal = edgeKey.includes('left') || edgeKey.includes('right');
    // A tabIndex or role from the consumer wins over the ones managed here.
    const ownsTabIndex = scrollerProps?.tabIndex === undefined;
    const ownsRole = scrollerProps?.role === undefined;

    useEffect(() => {
      const root = rootRef.current;
      const scroller = scrollerRef.current;
      if (!root || !scroller) {
        return;
      }
      const active = new Set(edgeKey.split(' '));
      let rtl = false;

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
            active.has(edge) && past[edge],
          ),
        );
      };

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

        if (ownsTabIndex) {
          const overflows =
            scroller.scrollHeight - scroller.clientHeight > 1 ||
            scroller.scrollWidth - scroller.clientWidth > 1;
          const needsFocus =
            overflows && !scroller.querySelector(FOCUSABLE_SELECTOR);
          const named =
            scroller.hasAttribute('aria-label') ||
            scroller.hasAttribute('aria-labelledby');
          setAttribute(scroller, 'tabindex', needsFocus ? '0' : null);
          if (ownsRole) {
            setAttribute(
              scroller,
              'role',
              needsFocus && named ? 'region' : null,
            );
          }
        }
        updateFades();
      };

      // Content can grow without the scroller's own box changing, so watch
      // the children too.
      const resizeObserver = new ResizeObserver(measure);
      const observe = () => {
        resizeObserver.disconnect();
        resizeObserver.observe(scroller);
        Array.from(scroller.children).forEach(child =>
          resizeObserver.observe(child),
        );
        measure();
      };
      // Subtree: focusable content can arrive anywhere below the scroller.
      const mutationObserver = new MutationObserver(observe);
      mutationObserver.observe(scroller, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['tabindex', 'href', 'contenteditable', 'controls'],
      });
      observe();
      scroller.addEventListener('scroll', updateFades, {passive: true});

      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        scroller.removeEventListener('scroll', updateFades);
      };
    }, [edgeKey, ownsTabIndex, ownsRole]);

    return (
      <div
        ref={rootRef}
        className={classNames(moduleStyles.scrollFade, className)}
        style={
          {
            '--scroll-fade-size':
              typeof fadeSize === 'number' ? `${fadeSize}px` : fadeSize,
            ...(fadeColor && {'--scroll-fade-color': fadeColor}),
            ...style,
          } as CSSProperties
        }
        {...rootProps}
      >
        <div
          {...scrollerProps}
          ref={setScrollerRef}
          className={classNames(
            moduleStyles.scroller,
            vertical && moduleStyles.scrollY,
            horizontal && moduleStyles.scrollX,
            scrollerClassName,
            scrollerProps?.className,
          )}
        >
          {children}
        </div>
        {fadeColor &&
          ALL_EDGES.filter(edge => edgeKey.includes(edge)).map(edge => (
            <span
              key={edge}
              aria-hidden="true"
              className={classNames(moduleStyles.fade, moduleStyles[edge])}
            />
          ))}
      </div>
    );
  },
);

ScrollFade.displayName = 'ScrollFade';

export default ScrollFade;
