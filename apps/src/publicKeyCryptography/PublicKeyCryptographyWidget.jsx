/** @file Root component for Public Key Cryptography widget */
import React from 'react';
import i18n from '@cdo/locale';
import CollapsiblePanel from './CollapsiblePanel';
import EqualColumns from './EqualColumns';
import Alice from './Alice';
import AliceInstructions from './AliceInstructions';
import Eve from './Eve';
import EveInstructions from './EveInstructions';
import Bob from './Bob';
import BobInstructions from './BobInstructions';
import ModuloClock from './ModuloClock';
import Dialog from '../templates/Dialog';
import WidgetContinueButton from '../templates/WidgetContinueButton';
import ToggleGroup from '../templates/ToggleGroup';

// Magic strings for view modes
const ALICE_VIEW = 'alice';
const EVE_VIEW = 'eve';
const BOB_VIEW = 'bob';
const ALL_VIEW = 'all';

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
      publicModulus: null,
      selectedCharacter: null
    };
  },

  setSelectedCharacter(selectedCharacter) {
    this.setState({selectedCharacter});
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

  renderSelectedCharacterView() {
    if (ALICE_VIEW === this.state.selectedCharacter) {
      return (
        <EqualColumns intercolumnarDistance={20}>
          <AliceInstructions/>
          {this.renderAliceControls()}
          {this.renderModuloClockColumn()}
        </EqualColumns>
      );
    } else if (EVE_VIEW === this.state.selectedCharacter) {
      return (
        <EqualColumns intercolumnarDistance={20}>
          <EveInstructions/>
          {this.renderEveControls()}
          {this.renderModuloClockColumn()}
        </EqualColumns>
      );
    } else if (BOB_VIEW === this.state.selectedCharacter) {
      return (
        <EqualColumns intercolumnarDistance={20}>
          <BobInstructions/>
          {this.renderBobControls()}
          {this.renderModuloClockColumn()}
        </EqualColumns>
      );
    } else if (ALL_VIEW === this.state.selectedCharacter) {
      return (
        <span>
          <EqualColumns intercolumnarDistance={20}>
            {this.renderAliceControls()}
            {this.renderEveControls()}
            {this.renderBobControls()}
          </EqualColumns>
          {this.renderModuloClock()}
        </span>
      );
    }
    return (
      <div style={{textAlign: 'center'}}>
        Select a character.
      </div>
    );
  },

  renderAliceControls() {
    return (
      <Alice
        ref={x => this.alice = x}
        disabled={this.state.animating}
        setPublicModulus={this.setPublicModulus}
        setPublicKey={this.setPublicKey}
        runModuloClock={this.runModuloClock}
      />
    );
  },

  renderEveControls() {
    return (
      <Eve
        ref={x => this.eve = x}
        disabled={this.state.animating}
        setPublicModulus={this.setPublicModulus}
        runModuloClock={this.runModuloClock}
      />
    );
  },

  renderBobControls() {
    return (
      <Bob
        ref={x => this.bob = x}
        disabled={this.state.animating}
        setPublicModulus={this.setPublicModulus}
        setPublicNumber={this.setPublicNumber}
        runModuloClock={this.runModuloClock}
      />
    );
  },

  renderModuloClockColumn() {
    return (
      <CollapsiblePanel title="Modulo clock">
        {this.renderModuloClock()}
      </CollapsiblePanel>
    );
  },

  renderModuloClock() {
    return (
      <ModuloClock
        ref={x => this.moduloClock = x}
        modulus={this.state.publicModulus || 1}
      />
    );
  },

  render() {
    return (
      <div style={style.root}>
        <CharacterSelect
          selectedCharacter={this.state.selectedCharacter}
          onChange={this.setSelectedCharacter}
        />
        <WidgetContinueButton/>
        <StartOverButton onClick={this.onStartOverClick}/>
        <div style={{clear: 'both', marginTop: 10}}>
          {this.renderSelectedCharacterView()}
        </div>
      </div>);
  }
});
export default PublicKeyCryptographyWidget;

/**
 * Toggle group of character view options: Alice|Eve|Bob|All
 */
const CharacterSelect = props => (
  <span>
    <strong style={characterSelectTextStyle}>Pick a character:</strong>
    <ToggleGroup
      selected={props.selectedCharacter}
      onChange={props.onChange}
    >
      <button value={ALICE_VIEW}>Alice</button>
      <button value={EVE_VIEW}>Eve</button>
      <button value={BOB_VIEW}>Bob</button>
      <button value={ALL_VIEW}>All</button>
    </ToggleGroup>
  </span>
);
CharacterSelect.propTypes = {
  selectedCharacter: React.PropTypes.string,
  onChange: React.PropTypes.func.isRequired
};
const characterSelectTextStyle = {
  lineHeight: '26px',
  verticalAlign: 'baseline',
  marginRight: 8
};

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
