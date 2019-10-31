import PropTypes from 'prop-types';
import React from 'react';
import {BASE_DIALOG_WIDTH} from '../constants';

/**
 * BaseDialog
 * A generic modal dialog that has an x-close in the upper right, and a
 * semi-transparent backdrop. Can be closed by clicking the x, clicking the
 * backdrop, or pressing esc.
 */
export default class BaseDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    handleClose: PropTypes.func,
    uncloseable: PropTypes.bool,
    hideCloseButton: PropTypes.bool,
    handleKeyDown: PropTypes.func,
    // For use in react-storybook; allows rendering dialog inline in story tables.
    hideBackdrop: PropTypes.bool,
    fullWidth: PropTypes.bool,
    fullHeight: PropTypes.bool,
    useUpdatedStyles: PropTypes.bool,
    noModalStyles: PropTypes.bool,
    children: PropTypes.node,
    fixedWidth: PropTypes.number,
    fixedHeight: PropTypes.number,
    style: PropTypes.object,
    soundPlayer: PropTypes.object
  };

  componentDidMount() {
    this.focusDialog();
  }

  componentDidUpdate() {
    this.focusDialog();
  }

  handleKeyDown = event => {
    if (event.key === 'Escape') {
      this.closeDialog();
    }
    this.props.handleKeyDown && this.props.handleKeyDown(event);
  };

  closeDialog = () => {
    if (!this.props.uncloseable && this.props.handleClose) {
      this.props.handleClose();
      if (this.props.soundPlayer) {
        this.props.soundPlayer.stopAllAudio();
      }
    }
  };

  /** @returns {Array.<Element>} */
  getTabbableElements() {
    return [].slice.call(this.refs.dialog.querySelectorAll('a,button,input'));
  }

  focusDialog() {
    // Don't steal focus if the active element is already a descendant of the
    // dialog - prevents focus loss on updates of open BaseDialog components.
    const descendantIsActive =
      document.activeElement &&
      this.refs.dialog &&
      this.refs.dialog.contains(document.activeElement);
    if (this.props.isOpen && !descendantIsActive) {
      this.refs.dialog.focus();
    }
  }

  render() {
    if (!this.props.isOpen && !this.props.hideBackdrop) {
      return <div />;
    }

    let bodyStyle, modalBodyStyle, xCloseStyle;
    if (this.props.fullWidth) {
      bodyStyle = {
        ...bodyStyle,
        width: '90%',
        marginLeft: '-45%'
      };
    }
    if (this.props.fullHeight) {
      bodyStyle = {
        ...bodyStyle,
        height: '80%'
      };
    }

    let wrapperClassNames = '';
    let modalClassNames = 'modal';
    let modalBodyClassNames = 'modal-body';
    let modalBackdropClassNames = 'modal-backdrop';

    if (this.props.useUpdatedStyles) {
      wrapperClassNames = 'dashboard-styles';
      modalBodyClassNames = '';
      modalBodyStyle = {
        background: '#fff',
        height: this.props.fixedHeight,
        maxHeight: !this.props.fixedHeight && '80vh',
        overflowX: 'hidden',
        overflowY:
          this.props.fixedHeight || this.props.fullHeight ? 'hidden' : 'auto',
        borderRadius: 4
      };
      bodyStyle = {
        ...bodyStyle,
        width: this.props.fixedWidth || BASE_DIALOG_WIDTH,
        marginLeft: -this.props.fixedWidth / 2 || -350
      };
      xCloseStyle = {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 10,
        color: '#ddd',
        cursor: 'pointer',
        fontSize: 24
      };
    } else if (this.props.noModalStyles) {
      modalClassNames = '';
      modalBodyClassNames = '';
    }
    bodyStyle = {
      ...bodyStyle,
      ...(this.props.hideBackdrop && {
        position: 'initial',
        marginLeft: 0
      }),
      ...this.props.style
    };
    let body = (
      <div
        style={bodyStyle}
        tabIndex="-1"
        className={modalClassNames}
        ref="dialog"
        onKeyDown={this.handleKeyDown}
      >
        <div style={modalBodyStyle} className={modalBodyClassNames}>
          {!this.props.uncloseable &&
            !this.props.hideCloseButton &&
            (this.props.useUpdatedStyles ? (
              <i
                id="x-close"
                className="fa fa-times"
                style={xCloseStyle}
                onClick={this.closeDialog}
              />
            ) : (
              <div
                id="x-close"
                className="x-close"
                onClick={this.closeDialog}
              />
            ))}
          {this.props.children}
        </div>
      </div>
    );

    if (this.props.hideBackdrop) {
      return body;
    }

    return (
      <div className={wrapperClassNames}>
        <div className={modalBackdropClassNames} onClick={this.closeDialog} />
        {body}
      </div>
    );
  }
}
