/**
 * Modal confirmation (OK/Cancel) dialog with custom text and events.
 */
import PropTypes from 'prop-types';
import React from 'react';
import {Modal, Button} from 'react-bootstrap';

export default class ConfirmationDialog extends React.Component {
  static propTypes = {
    show: PropTypes.bool,
    onOk: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    headerText: PropTypes.string.isRequired,
    bodyText: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
      .isRequired,
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    width: PropTypes.number
  };

  static defaultProps = {
    okText: 'OK',
    cancelText: 'Cancel',
    width: 500
  };

  render() {
    const style = {
      width: this.props.width,
      marginLeft: -this.props.width / 2
    };

    return (
      <Modal show={this.props.show} onHide={this.props.onCancel} style={style}>
        <Modal.Header closeButton>
          <Modal.Title>{this.props.headerText}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.props.bodyText}</Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.props.onOk}>
            {this.props.okText}
          </Button>
          {this.props.onCancel && (
            <Button onClick={this.props.onCancel}>
              {this.props.cancelText}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  }
}
