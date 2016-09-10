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
    handleKeyDown: React.PropTypes.func,
    hideBackdrop: React.PropTypes.bool,
    fullWidth: React.PropTypes.bool,
    useDeprecatedGlobalStyles: React.PropTypes.bool,
    children: React.PropTypes.node,
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

    var bodyStyle;
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

    let modalClassNames = "modal";
    let modalBodyClassNames = "modal-body";
    let modalBackdropClassNames = "modal-backdrop";

    if (this.props.useDeprecatedGlobalStyles) {
      modalClassNames = "modal dash_modal in";
      modalBodyClassNames = "modal-body dash_modal_body";
      modalBackdropClassNames = "modal-backdrop in";
    }
    var body = (
      <div
        style={bodyStyle}
        tabIndex="-1"
        className={modalClassNames}
        ref="dialog"
        onKeyDown={this.handleKeyDown}
      >
        <div className={modalBodyClassNames}>
          {!this.props.uncloseable &&
           <div id="x-close" className="x-close" onClick={this.closeDialog}></div>}
          {this.props.children}
        </div>
      </div>
    );

    if (this.props.hideBackdrop) {
      return body;
    }

    return (
      <div>
        <div className={modalBackdropClassNames} onClick={this.closeDialog}></div>
        {body}
      </div>
    );
  }
});
module.exports = BaseDialog;

if (BUILD_STYLEGUIDE) {
  var ExampleDialogButton = React.createClass({
    render() {
      return (
        <div>
          <BaseDialog
            isOpen={!!this.state && this.state.open}
            handleClose={() => this.setState({open: false})}
            {...this.props}
          >
            <div style={{border: '1px solid black'}}>
              The contents of the dialog go inside this box! woo
            </div>
          </BaseDialog>
          <button onClick={() => this.setState({open: true})}>
            Open the example dialog
          </button>
        </div>
      );
    }
  });

  BaseDialog.styleGuideExamples = storybook => {
    return storybook
      .storiesOf('BaseDialog', module)
      .addStoryTable([
        {
          name:'hiding the backdrop',
          description: `This is useful for debugging/developing dialogs
                        without having to constantly click to open it.`,
          story: () => (
            <BaseDialog hideBackdrop={true}>
              This is the dialog content!
            </BaseDialog>
          )
        }, {
          name: 'click to open',
          story: () => <ExampleDialogButton />
        }, {
          name: 'fullWidth',
          story: () => <ExampleDialogButton fullWidth/>
        }, {
          name: 'old style',
          description: `Dialogs with the useDeprecatedGlobalStyles flag
                        rely on global css. Don't do this.`,
          story: () => (
            <BaseDialog hideBackdrop={true} useDeprecatedGlobalStyles>
              <div className="modal-content no-modal-icon">
                <p className="dialog-title">Titles go in p.dialog-title tags?!?!?</p>
                Wrap dialog content inside a
                {' '}<code>{'<div class="model-content no-modal-icon"/>'}</code>{' '}
                because this component won't do that for you...
              </div>
            </BaseDialog>
          )
        }
      ]);
  };
}
