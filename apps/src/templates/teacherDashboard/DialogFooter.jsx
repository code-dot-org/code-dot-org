import React, {Component, PropTypes} from 'react';

const style = {
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
        <hr/>
        <div style={style.buttonRow}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
