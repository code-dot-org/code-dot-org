/** @file Shared styles for the animation picker dialog. */
var color = require('@cdo/apps/util/color');

module.exports = {
  dialog: {
    /**
     * Constrain the width of the dialog so that it is always vertically scrollable,
     * which is necessary for infinite scroll to work.
     * https://github.com/code-dot-org/code-dot-org/pull/34463
     */
    maxWidth: 1000,
    marginLeft: 0,
    transform: 'translate(-50%, 0)'
  },
  title: {
    color: color.purple,
    textAlign: 'center',
    margin: 0,
    fontSize: '140%',
    lineHeight: '140%'
  }
};
