/** @file Style properties shared among cryptopgraphy widget components */
import color from "../util/color";

/** @const {number} Line height for numbered steps, helps align input fields */
export const LINE_HEIGHT = 30;

export const COLORS = {
  publicModulus: color.lightest_cyan,
  publicKey: color.lighter_teal,
  privateKey: color.lightest_purple,
  publicNumber: color.lightest_yellow,
  secretNumber: color.lighter_orange
};
