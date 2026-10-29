import {type FocusEvent, useState} from 'react';

export function useFocusVisible() {
  const [focusVisible, setFocusVisible] = useState(false);

  return {
    focusVisible,
    focusHandlers: {
      onFocus: (event: FocusEvent<HTMLElement>) =>
        setFocusVisible(event.currentTarget.matches(':focus-visible')),
      onBlur: () => setFocusVisible(false),
    },
  };
}
