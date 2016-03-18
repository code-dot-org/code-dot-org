/** @file Reusable styles for interface mode toggle buttons. */

var color = require('../color');

module.exports = {
  buttonStyle: {
    display: 'inline-block',
    verticalAlign: 'top',
    border: '1px solid ' + color.light_gray,
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
    boxShadow: '2px 2px 5px ' + color.shadow + ' inset'
  },
  inactiveStyle: {
    backgroundColor: '#fff',
    color: color.light_gray,
    boxShadow: '0px 1px 5px ' + color.shadow
  },
  hiddenStyle: {
    display: 'none'
  },
  iconStyle: {
    margin: '0 0.3em'
  }
};
