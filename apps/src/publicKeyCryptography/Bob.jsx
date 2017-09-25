/** @file The Bob character panel from the crypto widget */
import React, {PropTypes} from 'react';
import CharacterPanel from './CharacterPanel';
import NumberedSteps, {Step} from './NumberedSteps';
import IntegerField from './IntegerField';
import IntegerTextbox from './IntegerTextbox';
import {
  PublicModulusDropdown,
  SecretNumberDropdown,
  GoButton,
  KeywordPublicModulus,
  KeywordPublicKey,
  KeywordPublicNumber,
  KeywordSecretNumber
} from './cryptographyFields';
import {COLORS} from './style';

const INITIAL_STATE = {
  publicModulus: null,
  publicKey: null,
  secretNumber: null,
  publicNumber: null
};

export default class Bob extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    setPublicModulus: PropTypes.func.isRequired,
    setPublicNumber: PropTypes.func.isRequired,
    runModuloClock: PropTypes.func.isRequired
  };

  state = {...INITIAL_STATE};

  startOver = () => this.setState(INITIAL_STATE);

  setPublicModulus(publicModulus) {
    this.setState({publicModulus});
    this.setSecretNumber(null);
    this.clearPublicNumber();
  }

  onPublicModulusChange = (publicModulus) => {
    this.setPublicModulus(publicModulus);
    this.props.setPublicModulus(publicModulus);
  };

  setPublicKey = (publicKey) => {
    this.setState({publicKey});
    this.clearPublicNumber();
  };

  setSecretNumber = (secretNumber) => {
    this.setState({secretNumber});
    this.clearPublicNumber();
  };

  computePublicNumber = () => {
    const {runModuloClock} = this.props;
    const {publicKey, secretNumber, publicModulus} = this.state;
    if ([publicKey, secretNumber, publicModulus].every(Number.isInteger)) {
      const dividend = publicKey * secretNumber;
      const publicNumber = dividend % publicModulus;
      runModuloClock(dividend, currentDividend => {
        this.setState({publicNumber: currentDividend % publicModulus});
      }, () => {
        this.setState({publicNumber});
        this.props.setPublicNumber(publicNumber);
      });
    } else {
      this.clearPublicNumber();
    }
  };

  clearPublicNumber() {
    this.setState({publicNumber: null});
  }

  render() {
    const {disabled} = this.props;
    const {
      publicModulus,
      publicKey,
      secretNumber,
      publicNumber
    } = this.state;
    return (
      <CharacterPanel title="Bob">
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
            Enter Alice's <KeywordPublicKey/>:
            <IntegerTextbox
              value={publicKey}
              onChange={this.setPublicKey}
              disabled={disabled}
              color={COLORS.publicKey}
            />
          </Step>
          <Step requires={[publicModulus, publicKey].every(Number.isInteger)}>
            Pick your <KeywordSecretNumber/>:
            <SecretNumberDropdown
              value={secretNumber}
              onChange={this.setSecretNumber}
              publicModulus={publicModulus}
              disabled={disabled}
            />
          </Step>
          <Step requires={[publicModulus, publicKey, secretNumber].every(Number.isInteger)}>
            Calculate your <KeywordPublicNumber/>:
            <div>
              (
              <IntegerField color={COLORS.publicKey} value={publicKey}/>
              {' x '}
              <IntegerField color={COLORS.secretNumber} value={secretNumber}/>
              {') MOD '}
              <IntegerField color={COLORS.publicModulus} value={publicModulus}/>
              <GoButton
                onClick={this.computePublicNumber}
                disabled={disabled}
              />
            </div>
            <div>
              Your computed <KeywordPublicNumber/>
              {' is '}
              <IntegerField
                className="public-number"
                color={COLORS.publicNumber}
                value={publicNumber}
              />
            </div>
          </Step>
        </NumberedSteps>
      </CharacterPanel>
    );
  }
}
