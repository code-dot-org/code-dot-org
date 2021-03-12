import PropTypes from 'prop-types';
import React, {Component} from 'react';

const style = {
  aboveFooter: {
    height: '90px'
  },
  footer: {
    position: 'absolute',
    height: '100px',
    padding: '0 20px',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'white',
    zIndex: '500'
  },
  buttonRow: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between'
  },
  rightAlign: {
    justifyContent: 'flex-end'
  }
};

/**
 * Extremely simple footer expecting two children to align to the left and
 * right sides of the dialog, respectively.
 * See DialogFooter.story.jsx for usage examples.
 */
export default class DialogFooter extends Component {
  static propTypes = {
    rightAlign: PropTypes.bool,
    children: PropTypes.any
  };

  render() {
    let buttonRowStyle = this.props.rightAlign
      ? {...style.buttonRow, ...style.rightAlign}
      : style.buttonRow;
    return (
      <div>
        <div style={style.aboveFooter} />
        <div style={style.footer}>
          <hr />
          <div style={buttonRowStyle}>{this.props.children}</div>
        </div>
      </div>
    );
  }
}
