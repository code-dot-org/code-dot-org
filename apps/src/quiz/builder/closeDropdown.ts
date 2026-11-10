// Dropdowns close through a context the builder doesn't share; a mousedown
// outside the open menu is what actually closes it.
export default function closeDropdown() {
  document.body.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
}
