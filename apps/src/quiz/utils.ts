export const toBool = (value: boolean | undefined) => value ?? false;

export function formatSubmittedAt(isoString: string): string {
  return new Date(isoString).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Unbounded mapping of a number to a unique letter or letters (A,B,...Z,AA,AB,...)
export function formatChoiceLetter(index: number): string {
  let n = index + 1;
  let label = '';
  while (n > 0) {
    label = String.fromCharCode(65 + ((n - 1) % 26)) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
}
