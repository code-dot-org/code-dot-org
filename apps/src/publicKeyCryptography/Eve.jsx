/** @file The Eve character from the cryptography widget */
import React from 'react';
import color from '../color';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import IntegerField from './IntegerField';
import IntegerTextbox from './IntegerTextbox';
import ValidatorField from './ValidatorField';
import {
  PrivateKeyDropdown,
  PublicModulusDropdown,
  SecretNumberDropdown,
  KeywordPublicModulus,
  KeywordPublicKey,
  KeywordPrivateKey,
  KeywordPublicNumber,
  KeywordSecretNumber
} from './cryptographyFields';
import {COLORS, LINE_HEIGHT} from './style';

const tdEquationStyleRHS = {
  lineHeight: LINE_HEIGHT + 'px',
  verticalAlign: 'top'
};
const tdEquationStyleLHS = Object.assign({}, tdEquationStyleRHS, {
  whiteSpace: 'nowrap'
});

const Eve = React.createClass({
  propTypes: {
    disabled: React.PropTypes.bool,
    setPublicModulus: React.PropTypes.func.isRequired,
    runModuloClock: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      publicModulus: null,
      publicKey: null,
      privateKey: null,
      publicNumber: null,
      secretNumber: null,
      checkingPrivateKey: false,
      privateKeyEquationResult: null,
      checkingSecretNumber: false,
      secretNumberEquationResult: null
    };
  },

  setPublicModulus(publicModulus) {
    this.setState({publicModulus});
  },

  onPublicModulusChange(publicModulus) {
    this.setPublicModulus(publicModulus);
    this.props.setPublicModulus(publicModulus);
  },

  setPublicKey(publicKey) {
    this.setState({publicKey});
  },

  setPrivateKey(privateKey) {
    const {runModuloClock} = this.props;
    const {publicKey, publicModulus} = this.state;
    this.setState({privateKey});
    if ([publicKey, privateKey, publicModulus].every(Number.isInteger)) {
      const dividend = publicKey * privateKey;
      const privateKeyEquationResult = dividend % publicModulus;
      runModuloClock(dividend, currentDividend => {
        this.setState({
          privateKeyEquationResult: currentDividend % publicModulus,
          checkingPrivateKey: true
        });
      }, () => {
        this.setState({
          privateKeyEquationResult,
          checkingPrivateKey: false
        });
      });
    } else {
      this.setState({privateKey: null, privateKeyEquationResult: null});
    }
  },

  setPublicNumber(publicNumber) {
    this.setState({publicNumber});
  },

  setSecretNumber(secretNumber) {
    this.setState({secretNumber});
    const {runModuloClock} = this.props;
    const {publicKey, publicModulus} = this.state;
    this.setState({secretNumber});
    if ([publicKey, secretNumber, publicModulus].every(Number.isInteger)) {
      const dividend = publicKey * secretNumber;
      const secretNumberEquationResult = dividend % publicModulus;
      runModuloClock(dividend, currentDividend => {
        this.setState({
          secretNumberEquationResult: currentDividend % publicModulus,
          checkingSecretNumber: true
        });
      }, () => {
        this.setState({
          secretNumberEquationResult,
          checkingSecretNumber: false
        });
      });
    } else {
      this.setState({secretNumber: null, secretNumberEquationResult: null});
    }
  },

  render() {
    const {disabled} = this.props;
    const {
      publicModulus,
      publicKey,
      privateKey,
      publicNumber,
      secretNumber,
      checkingPrivateKey,
      privateKeyEquationResult,
      checkingSecretNumber,
      secretNumberEquationResult
    } = this.state;
    return (
      <CollapsiblePanel title="Eve">
        <NumberedSteps>
          <div>
            Set a <KeywordPublicModulus/>:
            <PublicModulusDropdown
              value={publicModulus}
              onChange={this.onPublicModulusChange}
              disabled={disabled}
            />
          </div>
          <div>
            Enter Alice's <KeywordPublicKey/>:
            <IntegerTextbox
              value={publicKey}
              onChange={this.setPublicKey}
              disabled={disabled}
              color={COLORS.publicKey}
            />
          </div>
          <div>
            Crack Alice's <KeywordPrivateKey/>:
            <PrivateKeyDropdown
              publicModulus={publicModulus}
              value={privateKey}
              onChange={this.setPrivateKey}
              disabled={disabled}
            />
            <table>
              <tbody>
                <tr style={{height: LINE_HEIGHT}}>
                  <td width="1%" style={tdEquationStyleLHS}>
                    {'('}
                    <IntegerField color={COLORS.publicKey} value={publicKey}/>
                    {' x '}
                    <IntegerField color={COLORS.privateKey} value={privateKey}/>
                    {') MOD '}
                    <IntegerField color={COLORS.publicModulus} value={publicModulus}/>
                  </td>
                  <td style={tdEquationStyleRHS}>
                    {' = '}
                    <IntegerField color={color.white} value={1}/>
                    <ValidatorField
                      value={privateKeyEquationResult}
                      expectedValue={1}
                      shouldEvaluate={!checkingPrivateKey}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            Enter Bob's <KeywordPublicNumber/>:
            <IntegerTextbox
              value={publicNumber}
              onChange={this.setPublicNumber}
              disabled={disabled}
              color={COLORS.publicNumber}
            />
          </div>
          <div>
            Crack Bob's <KeywordSecretNumber/>:
            <SecretNumberDropdown
              value={secretNumber}
              onChange={this.setSecretNumber}
              publicModulus={publicModulus}
              disabled={disabled}
            />
            <table>
              <tbody>
                <tr style={{height: LINE_HEIGHT}}>
                  <td width="1%" style={tdEquationStyleLHS}>
                    {'('}
                    <IntegerField color={COLORS.publicKey} value={publicKey}/>
                    {' x '}
                    <IntegerField color={COLORS.secretNumber} value={secretNumber}/>
                    {') MOD '}
                    <IntegerField color={COLORS.publicModulus} value={publicModulus}/>
                  </td>
                  <td style={tdEquationStyleRHS}>
                    {' = '}
                    <IntegerField color={COLORS.publicNumber} value={publicNumber}/>
                    <ValidatorField
                      value={secretNumberEquationResult}
                      expectedValue={publicNumber}
                      shouldEvaluate={!checkingSecretNumber}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </NumberedSteps>
      </CollapsiblePanel>);
  }
});
export default Eve;
