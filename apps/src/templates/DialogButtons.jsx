import Button from './Button';
var React = require('react');
var msg = require('../locale');
var Lightbulb = require('./Lightbulb');

var DialogButtons = React.createClass({
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
    tryAgain: React.PropTypes.string
  },

  render: function () {
    var okButton, cancelButton, confirmButton, previousButton, hintButton, againButton, nextButton;

    var style = {
      confirmButton: {
        'float': 'right'
      },
      nextButton: {
        'float': 'right'
      },
      lightbulb: {
        margin: '-9px 0px -9px -5px'
      }
    };

    if (this.props.ok) {
      okButton = (
        <div className="farSide">
          <Button type="primary" id="ok-button" className="secondary">
            {msg.dialogOK()}
          </Button>
        </div>
      );
    }

    if (this.props.cancelText) {
      cancelButton = (
        <Button type="cancel" id="again-button" className={this.props.cancelButtonClass || ''}>
          {this.props.cancelText}
        </Button>
      );
    }

    if (this.props.confirmText) {
      confirmButton = (
        <Button type="primary" id="confirm-button" className="launch" style={style.confirmButton}>
          {this.props.confirmText}
        </Button>
      );
    }

    if (this.props.previousLevel) {
      previousButton = (
        <Button type="primary" id="back-button" className="launch">
          {msg.backToPreviousLevel()}
        </Button>
      );
    }

    if (this.props.tryAgain) {
      if (this.props.isK1 && !this.props.freePlay) {
        againButton = (
          <Button
            type="cancel"
            size="large"
            arrow="left"
            id="again-button"
            className="launch"
          >
            {this.props.tryAgain}
          </Button>
        );
      } else {
        if (this.props.shouldPromptForHint) {
          hintButton = (
            <Button type="default" id="hint-request-button">
              <Lightbulb size={32} style={style.lightbulb}/>
              {msg.hintRequest()}
            </Button>
          );
        }
        againButton = (
          <Button type="cancel" id="again-button" className="launch">
            {this.props.tryAgain}
          </Button>
        );
      }
    }

    if (this.props.nextLevel) {
      nextButton = (this.props.isK1 && !this.props.freePlay) ?
                   (
                     <Button
                       type="primary"
                       size="large"
                       arrow="right"
                       id="continue-button"
                       className="launch"
                       style={style.nextButton}
                     >
                       {this.props.continueText}
                     </Button>
                   ) : (
                     <Button
                       type="primary"
                       id="continue-button"
                       className="launch"
                       style={style.nextButton}
                     >
                       {this.props.continueText}
                     </Button>
                   );
    }

    return (
      <div>
        {okButton}
        {cancelButton}
        {confirmButton}
        {previousButton}
        {hintButton}
        {againButton}
        {nextButton}
      </div>
    );
  },
});

module.exports = DialogButtons;

if (BUILD_STYLEGUIDE) {
  DialogButtons.styleGuideExamples = storybook => {
    storybook
      .deprecatedStoriesOf(
        'DialogButtons',
        module,
        {
          reason: "The component had way too many properties",
          replacement: "Button",
        })
      .addStoryTable([
        {
          name: 'ok',
          story: () => <DialogButtons ok={true}/>
        }, {
          name: 'cancelText',
          story: () => <DialogButtons cancelText="Custom Cancel Text"/>,
        }, {
          name: 'confirmText',
          story: () => <DialogButtons confirmText="Custom Confirm Text"/>,
        }, {
          name: 'previousLevel',
          story: () => <DialogButtons previousLevel={true}/>,
        }, {
          name: 'nextLevel',
          story: () => <DialogButtons nextLevel={true} continueText="Custom Continue Text"/>,
        }, {
          name: 'tryAgain',
          story: () => <DialogButtons tryAgain="Custom Try Again Text"/>,
        }, {
          name: 'tryAgain with hint',
          story: () => <DialogButtons shouldPromptForHint={true} tryAgain="Custom Try Again Text"/>,
        }, {
          name: 'K1 customizations',
          description: 'To use k1 customization, you must pass an assetUrl function.',
          story: () => (
            <DialogButtons
              isK1={true}
              tryAgain="Custom Try Again"
              nextLevel={true}
              continueText="Custom Continue"
              assetUrl={url => '/blockly/'+url}
            />
          ),
        }, {
          name: 'K1 freePlay',
          description: 'To use k1 customization, you must pass an assetUrl function.',
          story: () => (
            <DialogButtons
              isK1={true}
              freePlay={true}
              tryAgain="Custom Try Again"
              nextLevel={true}
              continueText="Custom Continue"
              assetUrl={url => '/blockly/'+url}
            />
          ),
        }
      ]);
  };
}
