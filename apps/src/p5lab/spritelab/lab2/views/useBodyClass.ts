import {useEffect} from 'react';

/** Keeps a class on the page's body while the component is on the page, for
    styles that must reach elements outside the component's own. */
export default function useBodyClass(className: string): void {
  useEffect(() => {
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [className]);
}
