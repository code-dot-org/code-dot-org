import {useEffect, useState} from 'react';
import Confetti from 'react-dom-confetti';

/**
 * Port of apps/src/templates/BackToFrontConfetti.jsx: confetti shoots up from
 * behind the certificate (z-index -1), then falls in front of it (z-index 1).
 * `active` must start false; the flip to true fires the burst.
 */
export function BackToFrontConfetti({active}: {active: boolean}) {
  const [confettiOnTop, setConfettiOnTop] = useState(false);

  useEffect(() => {
    if (!active || confettiOnTop) {
      return;
    }

    const timeout = window.setTimeout(() => setConfettiOnTop(true), 700);
    return () => window.clearTimeout(timeout);
  }, [active, confettiOnTop]);

  return (
    <div
      style={{
        left: '50%',
        position: 'relative',
        zIndex: confettiOnTop ? 1 : -1,
      }}
    >
      <Confetti active={active} />
    </div>
  );
}
