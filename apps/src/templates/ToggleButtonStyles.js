/** @file Reusable styles for interface mode toggle buttons. */

var color = require("../util/color");

module.exports = {
  buttonStyle: {
    display: 'inline-block',
    verticalAlign: 'top',
    borderStyle: 'solid',
    borderColor: color.light_gray,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    margin: '0 0 8px 0',
    padding: '2px 6px',
    fontSize: 14
  },
  toggleButtonStyle: {
    borderRightWidth: '0 !important',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
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
    backgroundColor: color.orange,
    color: color.white,
    boxShadow: '2px 2px 5px ' + color.shadow + ' inset'
  },
  inactiveStyle: {
    backgroundColor: color.white,
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
