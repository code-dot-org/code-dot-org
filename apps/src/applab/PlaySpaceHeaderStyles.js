/** @file Reusable styles for components used by PlaySpaceHeader. */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */

module.exports = {
  buttonStyle: {
    display: 'inline-block',
    verticalAlign: 'top',
    border: '1px solid #949ca2',
    margin: '0 0 8px 0',
    padding: '2px 6px',
    fontSize: 14
  },
  toggleButtonStyle: {
    borderRightWidth: '0 !important',
    borderRadius: 0
  },
  firstButtonStyle: {
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 4
  },
  lastButtonStyle: {
    borderRightWidth: '1px !important',
    borderBottomRightRadius: 4,
    borderTopRightRadius: 4
  },
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
  },
  iconStyle: {
    margin: '0 0.3em'
  }
};
