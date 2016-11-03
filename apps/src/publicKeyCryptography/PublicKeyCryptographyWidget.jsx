/** @file Root component for Public Key Cryptography widget */
import React from 'react';
import i18n from '@cdo/locale';
import EqualColumns from './EqualColumns';
import Alice from './Alice';
import Bob from './Bob';
import Eve from './Eve';
import ModuloClock from './ModuloClock';
import Dialog from '../templates/Dialog';
import WidgetContinueButton from '../templates/WidgetContinueButton';

const style = {
  root: {
    fontFamily: `"Gotham 4r", sans-serif`
  },
  hyperlinksList: {
    fontFamily: `"Gotham 4r", sans-serif`,
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10
  }
};

/** Root component for Public Key Cryptography widget */
const PublicKeyCryptographyWidget = React.createClass({
  getInitialState() {
    return {
      animating: false,
      publicModulus: null
    };
  },

  setPublicModulus(publicModulus) {
    // Anyone can set the public modulus.  Inform everyone.
    this.alice.setPublicModulus(publicModulus);
    this.bob.setPublicModulus(publicModulus);
    this.eve.setPublicModulus(publicModulus);
    this.setState({publicModulus});
  },

  setPublicKey(publicKey) {
    // Only Alice can set the public key.  Inform Bob and Eve.
    this.bob.setPublicKey(publicKey);
    this.eve.setPublicKey(publicKey);
  },

  setPublicNumber(publicNumber) {
    // Only Bob can set the public number.  Inform Alice and Eve.
    this.alice.setPublicNumber(publicNumber);
    this.eve.setPublicNumber(publicNumber);
  },

  runModuloClock(dividend, onStep, onComplete) {
    const duration = 1000;
    this.setState({animating: true});
    this.moduloClock.animateTo(dividend, duration, onStep, (finalValue) => {
      this.setState({animating: false});
      onComplete(finalValue);
    });
  },

  onStartOverClick() {
    this.alice.startOver();
    this.bob.startOver();
    this.eve.startOver();
    this.setState({publicModulus: null});
  },

  render() {
    return (
      <div style={style.root}>
        <EqualColumns intercolumnarDistance={20}>
          <Alice
            ref={x => this.alice = x}
            disabled={this.state.animating}
            setPublicModulus={this.setPublicModulus}
            setPublicKey={this.setPublicKey}
            runModuloClock={this.runModuloClock}
          />
          <Eve
            ref={x => this.eve = x}
            disabled={this.state.animating}
            setPublicModulus={this.setPublicModulus}
            runModuloClock={this.runModuloClock}
          />
          <Bob
            ref={x => this.bob = x}
            disabled={this.state.animating}
            setPublicModulus={this.setPublicModulus}
            setPublicNumber={this.setPublicNumber}
            runModuloClock={this.runModuloClock}
          />
        </EqualColumns>
        <ModuloClock
          ref={x => this.moduloClock = x}
          modulus={this.state.publicModulus || 1}
        />
        <WidgetContinueButton/>
        <StartOverButton onClick={this.onStartOverClick}/>
      </div>);
  }
});
export default PublicKeyCryptographyWidget;

const StartOverButton = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {confirming: false};
  },

  confirm() {
    this.setState({confirming: true});
  },

  onConfirm() {
    this.props.onClick();
    this.setState({confirming: false});
  },

  onCancel() {
    this.setState({confirming: false});
  },

  render() {
    return (
      <span>
        <button
          className="btn btn-info pull-right"
          onClick={this.confirm}
        >
          {i18n.clearPuzzle()}
        </button>
        <Dialog
          isOpen={this.state.confirming}
          uncloseable
          title={i18n.clearPuzzle()}
          body={i18n.clearPuzzleConfirmHeader()}
          onConfirm={this.onConfirm}
          onCancel={this.onCancel}
        />
      </span>);
  }
});
