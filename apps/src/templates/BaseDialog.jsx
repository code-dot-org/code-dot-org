import React from 'react';

/**
 * BaseDialog
 * A generic modal dialog that has an x-close in the upper right, and a
 * semi-transparent backdrop. Can be closed by clicking the x, clicking the
 * backdrop, or pressing esc.
 */
var BaseDialog = React.createClass({
  propTypes: {
    isOpen: React.PropTypes.bool,
    handleClose: React.PropTypes.func,
    uncloseable: React.PropTypes.bool,
    hideCloseButton: React.PropTypes.bool,
    handleKeyDown: React.PropTypes.func,
    hideBackdrop: React.PropTypes.bool,
    fullWidth: React.PropTypes.bool,
    useUpdatedStyles: React.PropTypes.bool,
    useDeprecatedGlobalStyles: React.PropTypes.bool,
    children: React.PropTypes.node,
    assetUrl: React.PropTypes.func,
    fixedWidth: React.PropTypes.number,
    fixedHeight: React.PropTypes.number,
    style: React.PropTypes.object,
  },

  componentDidMount: function () {
    this.focusDialog();
  },

  componentDidUpdate: function () {
    this.focusDialog();
  },

  handleKeyDown: function (event) {
    if (event.key === 'Escape') {
      this.closeDialog();
    }
    this.props.handleKeyDown && this.props.handleKeyDown(event);
  },

  closeDialog: function () {
    if (!this.props.uncloseable && this.props.handleClose) {
      this.props.handleClose();
    }
  },

  /** @returns {Array.<Element>} */
  getTabbableElements() {
    return [].slice.call(this.refs.dialog.querySelectorAll('a,button,input'));
  },

  focusDialog: function () {
    // Don't steal focus if the active element is already a descendant of the
    // dialog - prevents focus loss on updates of open BaseDialog components.
    const descendantIsActive = document.activeElement && this.refs.dialog &&
        this.refs.dialog.contains(document.activeElement);
    if (this.props.isOpen && !descendantIsActive) {
      this.refs.dialog.focus();
    }
  },

  render: function () {
    if (!this.props.isOpen && !this.props.hideBackdrop) {
      return <div></div>;
    }

    let bodyStyle, modalBodyStyle, xCloseStyle;
    if (this.props.hideBackdrop) {
      bodyStyle = {
        position: 'initial',
        marginLeft: 0,
      };
    }
    if (this.props.fullWidth) {
      bodyStyle = Object.assign({}, bodyStyle, {
        width: '90%',
        marginLeft: '-45%'
      });
    }

    let wrapperClassNames = "";
    let modalClassNames = "modal";
    let modalBodyClassNames = "modal-body";
    let modalBackdropClassNames = "modal-backdrop";

    if (this.props.useUpdatedStyles) {
      wrapperClassNames = "dashboard-styles";
      modalBodyClassNames = "";
      modalBodyStyle = {
        background: `#fff top center url(${this.props.assetUrl('media/dialog/achievement_background.png')}) no-repeat`,
        height: this.props.fixedHeight,
        maxHeight: !this.props.fixedHeight && '80vh',
        overflowX: 'hidden',
        overflowY: this.props.fixedHeight ? 'hidden' : 'auto',
        borderRadius: 4,
      };
      bodyStyle = Object.assign({}, bodyStyle, {
        width: this.props.fixedWidth || 700,
        marginLeft: (-this.props.fixedWidth / 2) || -350,
      });
      xCloseStyle = {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 10,
        color: '#ddd',
        cursor: 'pointer',
        fontSize: 24,
      };
    } else if (this.props.useDeprecatedGlobalStyles) {
      modalClassNames = "modal dash_modal in";
      modalBodyClassNames = "modal-body dash_modal_body";
      modalBackdropClassNames = "modal-backdrop in";
    }
    bodyStyle = { ...bodyStyle, ...this.props.style };
    let body = (
      <div
        style={bodyStyle}
        tabIndex="-1"
        className={modalClassNames}
        ref="dialog"
        onKeyDown={this.handleKeyDown}
      >
        <div style={modalBodyStyle} className={modalBodyClassNames}>
          {!this.props.uncloseable && !this.props.hideCloseButton && (this.props.useUpdatedStyles ?
            <i className="fa fa-times" style={xCloseStyle} onClick={this.closeDialog}/> :
            <div id="x-close" className="x-close" onClick={this.closeDialog}></div>
          )}
          {this.props.children}
        </div>
      </div>
    );

    if (this.props.hideBackdrop) {
      return body;
    }

    return (
      <div className={wrapperClassNames}>
        <div className={modalBackdropClassNames} onClick={this.closeDialog}></div>
        {body}
      </div>
    );
  }
});
module.exports = BaseDialog;
