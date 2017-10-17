/** @file Dialog utility for React Storybook stories */
import React, {PropTypes} from 'react';

/**
 * Takes a Dialog-like component as a child.
 * Renders as button that will display that dialog when clicked.
 * Populates the isOpen property on the child dialog automatically.
 * Can also optionally populate handleClose, handleCancel, etc.
 */
export default class ExampleDialogButton extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  state = {open: false};

  render() {
    return (
      <div>
        {React.cloneElement(
          this.props.children,
          {
            isOpen: this.state.open,
            handleClose: () => this.setState({open: false})
          }
        )}
        <button onClick={() => this.setState({open: true})}>
          Open the example dialog
        </button>
      </div>
    );
  }
}
