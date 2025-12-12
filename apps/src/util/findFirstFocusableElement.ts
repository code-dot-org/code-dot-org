/**
 * Finds the first focusable element within a container.
 * @param container - The element to search within
 * @returns The first focusable element, or null if none found
 */
export const findFirstFocusableElement = (
  container: HTMLElement
): HTMLElement | null => {
  return container.querySelector<HTMLElement>(
    'a, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
};
