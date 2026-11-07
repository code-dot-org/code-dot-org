import {useEffect, type RefObject} from 'react';

// Sets the fade state that the scroll-fade mixin styles, on the scroller's parent.
export function useScrollFade(scrollRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = scrollRef.current;
    const wrapper = el?.parentElement;
    if (!el || !wrapper) {
      return;
    }
    const update = () => {
      // Written to the DOM rather than state, so scrolling doesn't re-render.
      const scrollbar = el.offsetWidth - el.clientWidth;
      wrapper.style.setProperty('--scrollbar-width', `${scrollbar}px`);
      // Allow 1px for subpixel scroll positions.
      wrapper.toggleAttribute('data-fade-top', el.scrollTop > 1);
      wrapper.toggleAttribute(
        'data-fade-bottom',
        el.scrollHeight - el.scrollTop - el.clientHeight > 1
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener('scroll', update);
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, [scrollRef]);
}
