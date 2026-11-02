import {useEffect, useRef} from 'react';

// Checkbox does not forward refs, so its input is reached through a wrapper.
export function useCheckboxValidity(error: string | undefined) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wrapperRef.current!.querySelector('input')!.setCustomValidity(error ?? '');
  }, [error]);

  return wrapperRef;
}
