// A pointer click parks focus on the clicked control, where Space — also a
// game key — re-activates it on every press for the rest of the session.
// Keyboard activation arrives with detail 0 and keeps focus, per platform
// convention. For any control that sits next to the playspace.
export function blurAfterPointerClick(event: React.MouseEvent<HTMLElement>) {
  if (event.detail > 0) {
    event.currentTarget.blur();
  }
}
