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
    closeCallbacks: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    closeCallbacks: ['handleClose'],
  };

  state = {open: false};
  open = () => this.setState({open: true});
  close = () => this.setState({open: false});

  render() {
    const closeCallbacks = {};
    this.props.closeCallbacks.forEach(name => closeCallbacks[name] = this.close);
    return (
      <div>
        {React.cloneElement(
          this.props.children,
          {
            isOpen: this.state.open,
            ...closeCallbacks,
          }
        )}
        <button onClick={this.open}>
          Open the example dialog
        </button>
      </div>
    );
  }
}
