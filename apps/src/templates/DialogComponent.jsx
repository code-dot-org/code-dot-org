/**
 * Dialog
 * A generic modal dialog that has an x-close in the upper right, and a
 * semi-transparent backdrop. Can be closed by clicking the x, clicking the
 * backdrop, or pressing esc.
 */
var Dialog = React.createClass({
  propTypes: {
    isOpen: React.PropTypes.bool.isRequired,
    handleClose: React.PropTypes.func.isRequired,
    uncloseable: React.PropTypes.bool
  },

  componentDidMount: function () {
    this.focusDialog();
  },

  componentDidUpdate: function () {
    this.focusDialog();
  },

  closeOnEscape: function (event) {
    if (event.key === 'Escape') {
      this.closeDialog();
    }
  },

  closeDialog: function () {
    if (!this.props.uncloseable) {
      this.props.handleClose();
    }
  },

  focusDialog: function () {
    if (this.props.isOpen) {
      this.refs.dialog.focus();
    }
  },

  render: function () {
    if (!this.props.isOpen) {
      return <div></div>;
    }

    return (
      <div>
        <div className="modal-backdrop in" onClick={this.closeDialog}></div>
        <div tabIndex="-1" className="modal dash_modal in" ref="dialog" onKeyDown={this.closeOnEscape}>
          <div className="modal-body dash_modal_body">
            {!this.props.uncloseable && <div id="x-close" className="x-close" onClick={this.closeDialog}></div>}
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});
module.exports = Dialog;
