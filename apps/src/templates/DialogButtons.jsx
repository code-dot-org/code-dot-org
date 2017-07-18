import LegacyButton from './LegacyButton';
import React, {PropTypes} from 'react';
var msg = require('@cdo/locale');
var Lightbulb = require('./Lightbulb');

var DialogButtons = React.createClass({
  propTypes: {
    assetUrl: PropTypes.func,
    cancelButtonClass: PropTypes.string,
    cancelText: PropTypes.string,
    confirmText: PropTypes.string,
    continueText: PropTypes.string,
    freePlay: PropTypes.bool,
    isK1: PropTypes.bool,
    nextLevel: PropTypes.bool,
    ok: PropTypes.bool,
    previousLevel: PropTypes.bool,
    shouldPromptForHint: PropTypes.bool,
    tryAgain: PropTypes.string
  },

  render: function () {
    var okButton, cancelButton, confirmButton, hintButton, againButton, nextButton;

    var style = {
      confirmButton: {
        'float': 'right'
      },
      nextButton: {
        'float': 'right'
      },
      lightbulb: {
        margin: '-9px 0px -9px -5px'
      },
      hintButton: {
        marginRight: 10
      }
    };

    if (this.props.ok) {
      okButton = (
        <div className="farSide">
          <LegacyButton type="primary" id="ok-button">
            {msg.dialogOK()}
          </LegacyButton>
        </div>
      );
    }

    if (this.props.cancelText) {
      cancelButton = (
        <LegacyButton type="cancel" id="again-button" className={this.props.cancelButtonClass || ''}>
          {this.props.cancelText}
        </LegacyButton>
      );
    }

    if (this.props.confirmText) {
      confirmButton = (
        <LegacyButton type="primary" id="confirm-button" className="launch" style={style.confirmButton}>
          {this.props.confirmText}
        </LegacyButton>
      );
    }

    if (this.props.tryAgain) {
      if (this.props.isK1 && !this.props.freePlay) {
        againButton = (
          <LegacyButton
            type="cancel"
            size="large"
            arrow="left"
            id="again-button"
            className="launch"
          >
            {this.props.tryAgain}
          </LegacyButton>
        );
      } else {
        if (this.props.shouldPromptForHint) {
          hintButton = (
            <LegacyButton type="default" id="hint-request-button" style={style.hintButton}>
              <Lightbulb size={32} style={style.lightbulb}/>
              {msg.hintRequest()}
            </LegacyButton>
          );
        }
        againButton = (
          <LegacyButton type="cancel" id="again-button" className="launch">
            {this.props.tryAgain}
          </LegacyButton>
        );
      }
    }

    if (this.props.nextLevel) {
      nextButton = (this.props.isK1 && !this.props.freePlay) ?
                   (
                     <LegacyButton
                       type="primary"
                       size="large"
                       arrow="right"
                       id="continue-button"
                       className="launch"
                       style={style.nextButton}
                     >
                       {this.props.continueText}
                     </LegacyButton>
                   ) : (
                     <LegacyButton
                       type="primary"
                       id="continue-button"
                       className="launch"
                       style={style.nextButton}
                     >
                       {this.props.continueText}
                     </LegacyButton>
                   );
    }

    return (
      <div>
        {okButton}
        {cancelButton}
        {confirmButton}
        {hintButton}
        {againButton}
        {nextButton}
      </div>
    );
  },
});

module.exports = DialogButtons;
