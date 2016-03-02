var msg = require('../locale');
var Lightbulb = require('./Lightbulb.jsx');

var Buttons = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func,
    cancelButtonClass: React.PropTypes.string,
    cancelText: React.PropTypes.string,
    confirmText: React.PropTypes.string,
    continueText: React.PropTypes.string,
    freePlay: React.PropTypes.bool,
    isK1: React.PropTypes.bool,
    nextLevel: React.PropTypes.bool,
    ok: React.PropTypes.bool,
    previousLevel: React.PropTypes.bool,
    shouldPromptForHint: React.PropTypes.bool,
    tryAgain: React.PropTypes.string,
  },

  render: function () {
    var okButton, cancelButton, confirmButton, previousButton, againButton, nextButton;

    if (this.props.ok) {
      okButton = (<div className="farSide">
        <button id="ok-button" className="secondary">
          {msg.dialogOK()}
        </button>
      </div>);
    }

    if (this.props.cancelText) {
      cancelButton = (<button id="again-button" className={this.props.cancelButtonClass || ''}>
        {this.props.cancelText}
      </button>);
    }

    if (this.props.confirmText) {
      confirmButton = (<button id="confirm-button" className="launch" style="float: right">
        {this.props.confirmText}
      </button>);
    }

    if (this.props.previousLevel) {
      previousButton = (<button id="back-button" className="launch">
        {msg.backToPreviousLevel()}
      </button>);
    }

    if (this.props.tryAgain) {
      if (this.props.isK1 && !this.props.freePlay) {
        againButton = (<div id="again-button" className="launch arrow-container arrow-left">
          <div className="arrow-head"><img src={this.props.assetUrl('media/tryagain-arrow-head.png')} alt="Arrowhead" width="67" height="130"/></div>
          <div className="arrow-text">{this.props.tryAgain}</div>
        </div>);
      } else {
        againButton = [];
        if (this.props.shouldPromptForHint) {
          againButton.push(<button id="hint-request-button" className="lightbulb-button">
            <Lightbulb size={32} style={{ margin: "-9px 0px -9px -5px" }}/>
            {msg.hintRequest()}
          </button>);
        }
        againButton.push(<button id="again-button" className="launch">
          {this.props.tryAgain}
        </button>);
      }
    }

    if (this.props.nextLevel) {
      nextButton = (this.props.isK1 && !this.props.freePlay) ?
          (<div id="continue-button" className="launch arrow-container arrow-right">
            <div className="arrow-head"><img src={this.props.assetUrl('media/next-arrow-head.png')} alt="Arrowhead" width="66" height="130"/></div>
            <div className="arrow-text">{this.props.continueText}</div>
          </div>) :
          (<button id="continue-button" className="launch" style="float: right">
            {this.props.continueText}
          </button>);
    }

    return (<div>
      {okButton}
      {cancelButton}
      {confirmButton}
      {previousButton}
      {againButton}
      {nextButton}
    </div>);
  },
});

module.exports = Buttons;

