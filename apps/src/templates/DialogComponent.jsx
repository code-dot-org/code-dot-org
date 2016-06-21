// TODO: Temporary measure to make sure code-studio doesn't end up with two Reacts
var React = window.React;

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
    uncloseable: React.PropTypes.bool,
    hideBackdrop: React.PropTypes.bool,
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

    var bodyStyle;
    if (this.props.hideBackdrop) {
      bodyStyle = {
        position: 'inherit',
        marginLeft: 0,
      };
    }

    var body = (
      <div style={bodyStyle}
           tabIndex="-1"
           className="modal dash_modal in"
           ref="dialog"
           onKeyDown={this.closeOnEscape}>
        <div className="modal-body dash_modal_body">
          {!this.props.uncloseable && <div id="x-close" className="x-close" onClick={this.closeDialog}></div>}
          {this.props.children}
        </div>
      </div>
    );

    if (this.props.hideBackdrop) {
      return body;
    }

    return (
      <div>
        <div className="modal-backdrop in" onClick={this.closeDialog}></div>
        {body}
      </div>
    );
  }
});
module.exports = Dialog;


if (process.env.NODE_ENV === 'development') {
  var ExampleDialogButton = React.createClass({
    render() {
      return (
        <div>
          <Dialog isOpen={!!this.state && this.state.open}
                  handleClose={() => this.setState({open: false})}>
            <div style={{border: '1px solid black'}}>
              The contents of the dialog go inside this box! woo
            </div>
          </Dialog>
          <button onClick={() => this.setState({open: true})}>Open the example dialog</button>
        </div>
      );
    }
  });

  Dialog.styleGuideExamples = {
    description: 'Render dialogs',
    examples: [
      {
        description: 'basic example with a button to open the dialog',
        render() {
          return <ExampleDialogButton />;
        },
      }, {
        description: 'Using hideBackdrop={true}. Useful for testing.',
        render() {
          return (
            <Dialog hideBackdrop={true}
                    isOpen={true}
                    handleClose={()=>null}>
              This is the dialog content!
            </Dialog>
          );
        }
      }, {
        description: 'With some more example CSS you can use...',
        render() {
          return (
            <Dialog hideBackdrop={true}
                    isOpen={true}
                    handleClose={()=>null}>
              <div className="modal-content no-modal-icon">
                <p className="dialog-title">Titles go in p.dialog-title tags?!?!?</p>
                Wrap dialog content inside a
                {' '}<code>{'<div class="model-content no-modal-icon"/>'}</code>{' '}
                because this component won't do that for you...
              </div>
            </Dialog>
          );
        },
      }, {
        description: 'margins... are interesting...',
        render() {
          return (
            <Dialog hideBackdrop={true}
                    isOpen={true}
                    handleClose={()=>null}>
              <div style={{border: '1px solid black'}}>
                check out these margins!
              </div>
            </Dialog>
          );
        },
      },
    ],
  };
}
