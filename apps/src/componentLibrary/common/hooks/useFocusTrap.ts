import {useEffect, useRef} from 'react';

const useFocusTrap = (containerRef: React.RefObject<HTMLElement>) => {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Save the currently focused element
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      // Focus on the dialog container or the first focusable element inside
      const focusableElements =
        containerRef.current.querySelectorAll<HTMLElement>(
          'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

      const firstElement = focusableElements[0];
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

      const focusableElements =
        containerRef.current.querySelectorAll<HTMLElement>(
          'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

      const focusable = Array.from(focusableElements);
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
