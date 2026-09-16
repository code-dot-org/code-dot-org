import {useCallback, useEffect, useRef, useState} from 'react';

// A message that displays briefly then clears itself, for transient canvas
// feedback like errors or mode hints. Each new message restarts the timer.
export function useTransientMessage(durationMs: number) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMessage = useCallback(
    (text: string) => {
      setMessage(text);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setMessage(null), durationMs);
    },
    [durationMs]
  );

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  return [message, showMessage] as const;
}
