/** @file Reusable styles for components used by DesignToggleRow. */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
/* global $ */

var buttonStyle = {
  display: 'inline-block',
  verticalAlign: 'top',
  border: '1px solid #949ca2',
  margin: '0 0 8px 0',
  padding: '2px 6px',
  fontSize: 14
};

module.exports = {
  buttonStyle: buttonStyle,
  codeButtonStyle: $.extend({}, buttonStyle, {
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    borderRightWidth: 0
  }),
  designButtonStyle: $.extend({}, buttonStyle, {
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0
  }),
  activeStyle: {
    backgroundColor: '#ffa000',
    color: '#fff',
    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3) inset'
  },
  inactiveStyle: {
    backgroundColor: '#fff',
    color: '#949ca2',
    boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.3)'
  },
  hiddenStyle: {
    display: 'none'
  }
};
