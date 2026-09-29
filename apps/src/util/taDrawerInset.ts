/**
 * The width the AI teaching-assistant drawer (apps/src/aiTeacherDrawer) takes
 * from the right edge of the viewport, 0 while it is closed.
 *
 * Page shells inset themselves by this width in CSS, reading it from
 * --ta-drawer-width; shared/css/ta-drawer.scss documents that side. CSS is
 * enough wherever the browser does the layout, but the labs size their panels
 * from window.innerWidth, which still counts the strip the drawer took. Those
 * widths come from availableContentWidth() instead, and the two must agree or
 * a lab's panels overflow the shell they sit in.
 *
 * Both answer with the geometry the page ends up with, not the geometry it has
 * mid-animation, which is why a shell whose contents are measured or computed
 * resizes in one step instead of animating.
 */

const WIDTH_PROPERTY = '--ta-drawer-width';
const TRANSITION_PROPERTY = '--ta-drawer-transition';

// MUI Drawer's default enter and leave transitions, for the shells that can
// animate with the drawer rather than resizing in one step.
const ENTER_TRANSITION = '225ms cubic-bezier(0, 0, 0.2, 1)';
const LEAVE_TRANSITION = '195ms cubic-bezier(0.4, 0, 0.6, 1)';

let inset = 0;

export function setTaDrawerInset(width: number) {
  if (width === inset) {
    return;
  }
  inset = width;

  const root = document.documentElement;
  root.style.setProperty(WIDTH_PROPERTY, `${width}px`);
  // A width of zero is the drawer closing; anything else is it opening, or
  // growing into the wider welcome layout.
  root.style.setProperty(
    TRANSITION_PROPERTY,
    width === 0 ? LEAVE_TRANSITION : ENTER_TRANSITION
  );

  // A lab redoes its width math only when the window resizes, and a drawer
  // opening is a resize as far as the lab is concerned.
  window.dispatchEvent(new Event('resize'));
}

/** Viewport width less whatever the drawer is occupying. */
export function availableContentWidth(): number {
  return window.innerWidth - inset;
}
