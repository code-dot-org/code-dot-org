import {useEffect} from 'react';

/**
 * useBodyScrollLock
 * A hook to toggle `overflow: hidden` on the `<body>` element to prevent scrolling.
 *
 * @param isActive - A boolean indicating whether the body scroll should be locked.
 */
const useBodyScrollLock = (isActive: boolean) => {
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden'; // Lock scroll
    } else {
      document.body.style.overflow = ''; // Restore scroll
    }

    return () => {
      // Ensure scroll is enabled when the component unmounts
      document.body.style.overflow = '';
    };
  }, [isActive]);
};

export default useBodyScrollLock;
