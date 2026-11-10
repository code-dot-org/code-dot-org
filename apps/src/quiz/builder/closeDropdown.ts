// The design system's dropdowns close through a context the builder can't
// reach; a mousedown outside the open menu is what actually closes them.
export default function closeDropdown() {
  document.body.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
}
