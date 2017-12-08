import React, {Component, PropTypes} from 'react';

const style = {
  aboveFooter: {
    height: '90px',
  },
  footer: {
    position: 'absolute',
    height: '100px',
    padding: '0 20px',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'white',
    zIndex: '50',
  },
  buttonRow: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between',
  }
};

/**
 * Extremely simple footer expecting two children to align to the left and
 * right sides of the dialog, respectively.
 * See DialogFooter.story.jsx for usage examples.
 */
export default class DialogFooter extends Component {
  static propTypes = {
    children: PropTypes.any,
  };

  render() {
    return (
      <div>
        <div style={style.aboveFooter}></div>
        <div style={style.footer}>
          <hr/>
          <div style={style.buttonRow}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
