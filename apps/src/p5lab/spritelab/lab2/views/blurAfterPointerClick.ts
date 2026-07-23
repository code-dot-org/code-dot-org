// Keyboard-synthesized clicks (Space/Enter on a focused control) arrive
// with detail 0; pointer clicks count ≥ 1.
export function isPointerClick(event: React.MouseEvent<HTMLElement>) {
  return event.detail > 0;
}

// A pointer click parks focus on the clicked control, where Space — also a
// game key — re-activates it on every press. Blur pointer activations;
// keyboard activation keeps focus, per platform convention.
export function blurAfterPointerClick(event: React.MouseEvent<HTMLElement>) {
  if (isPointerClick(event)) {
    event.currentTarget.blur();
  }
}
