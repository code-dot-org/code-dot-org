/** @file The Alice character panel from the crypto widget */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps, {Step} from './NumberedSteps';
import IntegerField from './IntegerField';
import IntegerTextbox from './IntegerTextbox';
import {
  PrivateKeyDropdown,
  PublicModulusDropdown,
  GoButton,
  KeywordPublicModulus,
  KeywordPublicKey,
  KeywordPrivateKey,
  KeywordPublicNumber,
  KeywordSecretNumber
} from './cryptographyFields';
import {computePublicKey} from './cryptographyMath';
import {COLORS} from './style';

const Alice = React.createClass({
  propTypes: {
    disabled: React.PropTypes.bool,
    setPublicModulus: React.PropTypes.func.isRequired,
    setPublicKey: React.PropTypes.func.isRequired,
    runModuloClock: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      publicModulus: null,
      privateKey: null,
      publicNumber: null,
      secretNumber: null
    };
  },

  startOver() {
    this.setState(this.getInitialState());
  },

  setPublicModulus(publicModulus) {
    this.setState({publicModulus});
    this.setPrivateKey(null);
    this.clearSecretNumber();
  },

  onPublicModulusChange(publicModulus) {
    this.setPublicModulus(publicModulus);
    this.props.setPublicModulus(publicModulus);
  },

  setPrivateKey(privateKey) {
    this.setState({privateKey});
    this.clearSecretNumber();
  },

  onPrivateKeyChange(privateKey) {
    const {publicModulus} = this.state;
    this.setPrivateKey(privateKey);
    this.props.setPublicKey(this.getPublicKey({privateKey, publicModulus}));
  },

  setPublicNumber(publicNumber) {
    this.setState({publicNumber});
    this.clearSecretNumber();
  },

  getPublicKey({privateKey, publicModulus}) {
    return privateKey && publicModulus ? computePublicKey(privateKey, publicModulus) : null;
  },

  computeSecretNumber() {
    const {runModuloClock} = this.props;
    const {publicModulus, privateKey, publicNumber} = this.state;
    if ([publicModulus, privateKey, publicNumber].every(Number.isInteger)) {
      const dividend = publicNumber * privateKey;
      const secretNumber = dividend % publicModulus;
      runModuloClock(dividend, currentDividend => {
        this.setState({secretNumber: currentDividend % publicModulus});
      }, () => {
        this.setState({secretNumber});
      });
    } else {
      this.clearSecretNumber();
    }
  },

  clearSecretNumber() {
    this.setState({secretNumber: null});
  },

  render() {
    const {disabled} = this.props;
    const {
      publicModulus,
      privateKey,
      publicNumber,
      secretNumber
    } = this.state;
    const publicKey = this.getPublicKey({privateKey, publicModulus});

    return (
      <CollapsiblePanel title="Alice">
        <NumberedSteps>
          <Step>
            Enter <KeywordPublicModulus/>:
            <PublicModulusDropdown
              value={publicModulus}
              onChange={this.onPublicModulusChange}
              disabled={disabled}
            />
          </Step>
          <Step requires={[publicModulus].every(Number.isInteger)}>
            Set a <KeywordPrivateKey/>:
            <PrivateKeyDropdown
              publicModulus={publicModulus}
              value={privateKey}
              onChange={this.onPrivateKeyChange}
              disabled={disabled}
            />
            <div>
              Your computed <KeywordPublicKey/>
              {' is '}
              <IntegerField className="public-key" color={COLORS.publicKey} value={publicKey}/>
            </div>
          </Step>
          <Step requires={[publicModulus, privateKey].every(Number.isInteger)}>
            Enter Bob's <KeywordPublicNumber/>:
            <IntegerTextbox
              value={publicNumber}
              onChange={this.setPublicNumber}
              disabled={disabled}
              color={COLORS.publicNumber}
            />
          </Step>
          <Step requires={[publicModulus, privateKey, publicNumber].every(Number.isInteger)}>
            Calculate Bob's <KeywordSecretNumber/>.
            <div>
              (
              <IntegerField color={COLORS.publicNumber} value={publicNumber}/>
              {' x '}
              <IntegerField color={COLORS.privateKey} value={privateKey}/>
              {') MOD '}
              <IntegerField color={COLORS.publicModulus} value={publicModulus}/>
              <GoButton
                onClick={this.computeSecretNumber}
                disabled={disabled}
              />
            </div>
            <div>
              Bob's <KeywordSecretNumber/>
              {' is '}
              <IntegerField
                className="secret-number"
                color={COLORS.secretNumber}
                value={secretNumber}
              />!
            </div>
          </Step>
        </NumberedSteps>
      </CollapsiblePanel>);
  }
});
export default Alice;
