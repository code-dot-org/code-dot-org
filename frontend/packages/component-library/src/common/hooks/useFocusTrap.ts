import {useEffect, useRef} from 'react';

const FOCUSABLE_SELECTOR =
  'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])';

// A disabled control never takes focus, so counting one as the first or last
// stop means the wrap below never fires and Tab walks out of the dialog.
// `aria-disabled` is deliberately not filtered: it stays focusable, and
// dropping it would make it unreachable instead.
const tabbableWithin = (container: HTMLElement): HTMLElement[] =>
  Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(element => !element.hasAttribute('disabled'));

const useFocusTrap = (containerRef: React.RefObject<HTMLElement>) => {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Save the currently focused element
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      // Focus on the dialog container or the first focusable element inside
      const [firstElement] = tabbableWithin(containerRef.current);
      firstElement?.focus();
    }

    return () => {
      if (previouslyFocusedElement.current) {
        // Restore focus to the previously focused element after the dialog closes
        previouslyFocusedElement.current.focus();
      }
    };
  }, [containerRef]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !containerRef.current) return;

      const focusable = tabbableWithin(containerRef.current);
      if (focusable.length === 0) {
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey) {
        // Shift + Tab: Move backward
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        // Tab: Move forward
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };

    // Add event listener when the component mounts
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // Clean up event listener when the component unmounts
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef]);
};

export default useFocusTrap;
