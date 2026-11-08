import classNames from 'classnames';
import {
  CSSProperties,
  FC,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
} from 'react';

import moduleStyles from './scrollFade.module.scss';

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

export interface ScrollFadeProps extends HTMLAttributes<HTMLDivElement> {
  /** Content of the scrolling area. */
  children: ReactNode;
  /** Height of each edge fade, in px. */
  fadeHeight?: number;
  /**
   * Color the edges fade into. Match the background behind the scrolling
   * area. Any CSS color, including a `var(--…)` token.
   */
  fadeColor?: string;
  /** Class name for the scrolling element, which holds the children. */
  scrollerClassName?: string;
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
 * A vertically scrolling area that fades its top and bottom edges while there
 * is more content to scroll to in that direction. Give it a height, or a flex
 * or grid slot, so that its content can overflow. When it overflows and has no
 * focusable content, the scroller becomes a tab stop so keyboard users can
 * scroll it.
 */
const ScrollFade: FC<ScrollFadeProps> = ({
  children,
  fadeHeight = 24,
  fadeColor = 'var(--background-neutral-primary)',
  className,
  scrollerClassName,
  style,
  ...HTMLAttributes
}: ScrollFadeProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const scroller = scrollerRef.current;
    if (!root || !scroller) {
      return;
    }
    // Written to the DOM rather than state, so scrolling doesn't re-render.
    const update = () => {
      const scrollbar = scroller.offsetWidth - scroller.clientWidth;
      root.style.setProperty('--scroll-fade-scrollbar-width', `${scrollbar}px`);
      // Allow 1px for subpixel scroll positions.
      root.toggleAttribute('data-fade-top', scroller.scrollTop > 1);
      const remaining =
        scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
      root.toggleAttribute('data-fade-bottom', remaining > 1);
      // Keyboard users need a way to scroll: focus the scroller itself, but
      // only when it overflows and has no focusable content of its own.
      const needsFocus =
        scroller.scrollHeight - scroller.clientHeight > 1 &&
        !scroller.querySelector(FOCUSABLE_SELECTOR);
      if (needsFocus) {
        scroller.setAttribute('tabindex', '0');
      } else {
        scroller.removeAttribute('tabindex');
      }
    };

    // Content can grow without the scroller's own box changing, so watch the
    // children too.
    const resizeObserver = new ResizeObserver(update);
    const observeChildren = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(scroller);
      Array.from(scroller.children).forEach(child =>
        resizeObserver.observe(child),
      );
      update();
    };
    const mutationObserver = new MutationObserver(observeChildren);
    mutationObserver.observe(scroller, {childList: true});
    observeChildren();
    scroller.addEventListener('scroll', update);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      scroller.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={classNames(moduleStyles.scrollFade, className)}
      style={
        {
          '--scroll-fade-height': `${fadeHeight}px`,
          '--scroll-fade-color': fadeColor,
          ...style,
        } as CSSProperties
      }
      {...HTMLAttributes}
    >
      <div
        ref={scrollerRef}
        className={classNames(moduleStyles.scroller, scrollerClassName)}
      >
        {children}
      </div>
      <span
        aria-hidden="true"
        className={classNames(moduleStyles.fade, moduleStyles.fadeTop)}
      />
      <span
        aria-hidden="true"
        className={classNames(moduleStyles.fade, moduleStyles.fadeBottom)}
      />
    </div>
  );
};

export default ScrollFade;
