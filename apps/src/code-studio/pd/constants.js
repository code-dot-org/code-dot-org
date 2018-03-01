/**
 * @fileoverview Constants used in pd components.
 */

/** Default max height for the React-Select menu popup, as defined in the imported react-select.css,
 * is 200px for the container, and 198 for the actual menu (to accommodate 2px for the border).
 * React-Select has props for overriding these default css styles. Increase the max height here:
 */
exports.SelectStyleProps = {
  menuContainerStyle: {
    maxHeight: 400
  },
  menuStyle: {
    maxHeight: 398
  }
};
