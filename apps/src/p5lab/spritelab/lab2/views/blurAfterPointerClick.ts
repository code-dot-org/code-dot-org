// event.detail is the click count; pressing Space/Enter on a focused
// control also fires a click, but with detail 0.
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

// A mouse press on a focusable region gives it focus, and the browser then
// draws the region's focus ring at the next key press, as if it had been
// reached by keyboard. The game is played with the keys, so a click on it
// was always followed by a ring. This stops the press from giving the
// region focus, and takes focus off whatever had it, so that the keys go
// to the game and nothing else. Tab still reaches the region and shows its
// ring. A press on a control inside the region is left alone.
export function keepFocusOffAfterMousePress(
  event: React.MouseEvent<HTMLElement>
) {
  const pressed = event.target;
  if (
    pressed instanceof Element &&
    pressed.closest('button, input, textarea, select, a, [role="button"]')
  ) {
    return;
  }
  event.preventDefault();
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}
