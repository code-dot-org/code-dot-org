import React, {FC, useCallback, useEffect, useRef} from 'react';

import styles from './lesson-deep-dive-container.module.scss';

interface FizzyButtonProps {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}

const FizzyButton: FC<FizzyButtonProps> = ({onClick, ariaLabel, children, className}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createBubble = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.random() * 9 + 4;
    const bubble = document.createElement('span');
    bubble.className = styles.fizzBubble;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${rect.left + Math.random() * rect.width}px`;
    bubble.style.top = `${rect.bottom - size}px`;
    bubble.style.animationDuration = `${Math.random() * 1.8 + 1.2}s`;
    bubble.style.setProperty('--fizz-drift', `${(Math.random() - 0.5) * 50}px`);
    const hue = Math.random() * 360;
    bubble.style.background = `radial-gradient(circle at 30% 30%, hsl(${hue} 100% 88%), hsl(${hue} 80% 55%))`;
    document.body.appendChild(bubble);
    bubble.addEventListener('animationend', () => bubble.remove(), {
      once: true,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    createBubble();
    intervalRef.current = setInterval(createBubble, 80);
  }, [createBubble]);

  const handleMouseLeave = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    },
    []
  );

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`${styles.fizzyButton} ${className ?? styles.arrowButton}`}
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
};

export default FizzyButton;
