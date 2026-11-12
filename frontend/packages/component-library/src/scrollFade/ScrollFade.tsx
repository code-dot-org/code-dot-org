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

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]:not([contenteditable="false"])',
].join(', ');

const hasFocusableContent = (scroller: HTMLElement) =>
  Array.from(scroller.querySelectorAll(FOCUSABLE_SELECTOR)).some(
    el => !el.closest('[hidden], [inert], fieldset:disabled'),
  );

// The root never scrolls and is not the labelled element, so these belong in
// scrollerProps.
export interface ScrollFadeProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'onScroll' | 'aria-label' | 'aria-labelledby'
  > {
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
   * Attributes for the scrolling element, including `onScroll`. Give it an
   * `aria-label` or `aria-labelledby`: while it overflows it is then announced
   * as a named region.
   */
  scrollerProps?: HTMLAttributes<HTMLDivElement>;
}

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see `./__tests__/ScrollFade.test.tsx`)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
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
    const [overflows, setOverflows] = useState(false);
    const [hasFocusable, setHasFocusable] = useState(false);
    // Chrome and Firefox already make such a scroller focusable, but Safari
    // does not, and none of them name it.
    const needsFocus = overflows && !hasFocusable;

    const activeEdges = ALL_EDGES.filter(edge => edges.includes(edge));
    const edgeKey = activeEdges.join(' ');
    const vertical =
      activeEdges.includes('top') || activeEdges.includes('bottom');
    const horizontal =
      activeEdges.includes('left') || activeEdges.includes('right');
    const named = Boolean(
      scrollerProps?.['aria-label'] || scrollerProps?.['aria-labelledby'],
    );
    // An explicit key, even set to undefined, means the caller owns it.
    const ownsRole = !scrollerProps || !('role' in scrollerProps);
    const ownsTabIndex = !scrollerProps || !('tabIndex' in scrollerProps);

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

      // Written to the DOM rather than state, so scrolling doesn't re-render.
      const updateFades = () => {
        const rtl = getComputedStyle(scroller).direction === 'rtl';
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

      const measure = () => {
        // Border plus scrollbar on each side; the fades stop short of both.
        // Rounding can make a difference come out at -1px, which is invalid.
        const left = scroller.clientLeft;
        const right = scroller.offsetWidth - scroller.clientWidth - left;
        const bottom =
          scroller.offsetHeight - scroller.clientHeight - scroller.clientTop;
        root.style.setProperty(
          '--scroll-fade-inset-left',
          `${Math.max(0, left)}px`,
        );
        root.style.setProperty(
          '--scroll-fade-inset-right',
          `${Math.max(0, right)}px`,
        );
        root.style.setProperty(
          '--scroll-fade-inset-bottom',
          `${Math.max(0, bottom)}px`,
        );
        setOverflows(
          (vertical && scroller.scrollHeight - scroller.clientHeight > 1) ||
            (horizontal && scroller.scrollWidth - scroller.clientWidth > 1),
        );
        setHasFocusable(hasFocusableContent(scroller));
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
      // Anything below the children can change the size or the focusable
      // content without resizing an observed box.
      let frame = 0;
      const mutationObserver = new MutationObserver(records => {
        if (
          records.some(r => r.type === 'childList' && r.target === scroller)
        ) {
          observeChildren();
        }
        frame ||= requestAnimationFrame(() => {
          frame = 0;
          measure();
        });
      });
      mutationObserver.observe(scroller, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: [
          'tabindex',
          'href',
          'contenteditable',
          'controls',
          'disabled',
          'hidden',
          'inert',
          'type',
        ],
      });
      observeChildren();
      measure();
      scroller.addEventListener('scroll', updateFades, {passive: true});

      return () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        scroller.removeEventListener('scroll', updateFades);
      };
    }, [edgeKey, vertical, horizontal]);

    const attributes: HTMLAttributes<HTMLDivElement> = {...scrollerProps};
    if (ownsRole) {
      if (named && overflows) {
        attributes.role = 'region';
      } else {
        // A label on a generic element is ignored, and flagged by axe.
        delete attributes['aria-label'];
        delete attributes['aria-labelledby'];
      }
    }
    if (ownsTabIndex && needsFocus) {
      attributes.tabIndex = 0;
    }

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
          {...attributes}
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
