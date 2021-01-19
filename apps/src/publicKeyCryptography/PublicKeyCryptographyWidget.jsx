/** @file Root component for Public Key Cryptography widget */
import PropTypes from 'prop-types';
import React from 'react';
import CharacterPanel from './CharacterPanel';
import EqualColumns from './EqualColumns';
import Alice from './Alice';
import AliceInstructions from './AliceInstructions';
import Eve from './Eve';
import EveInstructions from './EveInstructions';
import Bob from './Bob';
import BobInstructions from './BobInstructions';
import ModuloClock from './ModuloClock';
import color from '../util/color';
import FontAwesome from '../templates/FontAwesome';
import WidgetContinueButton from '../templates/WidgetContinueButton';
import StartOverButton from './StartOverButton';
import ToggleGroup from '../templates/ToggleGroup';

// Magic strings for view modes
const ALICE_VIEW = 'alice';
const EVE_VIEW = 'eve';
const BOB_VIEW = 'bob';
const ALL_VIEW = 'all';

const style = {
  root: {
    fontFamily: `"Gotham 4r", sans-serif`,
    marginTop: 10
  },
  characterViewWrapper: {
    clear: 'both',
    marginTop: 10
  },
  noCharacterSelected: {
    textAlign: 'center',
    padding: '100px 0',
    fontSize: 'x-large',
    color: color.light_gray
  }
};

/** Root component for Public Key Cryptography widget */
export default class PublicKeyCryptographyWidget extends React.Component {
  state = {
    animating: false,
    publicModulus: null,
    selectedCharacter: null
  };

  setSelectedCharacter = selectedCharacter =>
    this.setState({selectedCharacter});

  setPublicModulus = publicModulus => {
    // Anyone can set the public modulus.  Inform everyone.
    this.alice && this.alice.setPublicModulus(publicModulus);
    this.bob && this.bob.setPublicModulus(publicModulus);
    this.eve && this.eve.setPublicModulus(publicModulus);
    this.setState({publicModulus});
  };

  setPublicKey = publicKey => {
    // Only Alice can set the public key.  Inform Bob and Eve.
    this.bob && this.bob.setPublicKey(publicKey);
    this.eve && this.eve.setPublicKey(publicKey);
  };

  setPublicNumber = publicNumber => {
    // Only Bob can set the public number.  Inform Alice and Eve.
    this.alice && this.alice.setPublicNumber(publicNumber);
    this.eve && this.eve.setPublicNumber(publicNumber);
  };

  runModuloClock = (dividend, onStep, onComplete) => {
    const duration = 1000;
    this.setState({animating: true});
    this.moduloClock.animateTo(dividend, duration, onStep, finalValue => {
      this.setState({animating: false});
      onComplete(finalValue);
    });
  };

  onStartOverClick = () => {
    this.alice && this.alice.startOver();
    this.bob && this.bob.startOver();
    this.eve && this.eve.startOver();
    this.setState({publicModulus: null});
  };

  renderCharacterView(selectedCharacter) {
    if (ALICE_VIEW === selectedCharacter) {
      return (
        <EqualColumns intercolumnarDistance={20}>
          <AliceInstructions />
          {this.renderAliceControls()}
          {this.renderModuloClockPanel()}
        </EqualColumns>
      );
    } else if (EVE_VIEW === selectedCharacter) {
      return (
        <EqualColumns intercolumnarDistance={20}>
          <EveInstructions />
          {this.renderEveControls()}
          {this.renderModuloClockPanel()}
        </EqualColumns>
      );
    } else if (BOB_VIEW === selectedCharacter) {
      return (
        <EqualColumns intercolumnarDistance={20}>
          <BobInstructions />
          {this.renderBobControls()}
          {this.renderModuloClockPanel()}
        </EqualColumns>
      );
    } else if (ALL_VIEW === selectedCharacter) {
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
      <div style={style.noCharacterSelected}>
        Please pick a character first.
      </div>
    );
  }

  renderAliceControls() {
    return (
      <Alice
        ref={x => (this.alice = x)}
        disabled={this.state.animating}
        setPublicModulus={this.setPublicModulus}
        setPublicKey={this.setPublicKey}
        runModuloClock={this.runModuloClock}
      />
    );
  }

  renderEveControls() {
    return (
      <Eve
        ref={x => (this.eve = x)}
        disabled={this.state.animating}
        setPublicModulus={this.setPublicModulus}
        runModuloClock={this.runModuloClock}
      />
    );
  }

  renderBobControls() {
    return (
      <Bob
        ref={x => (this.bob = x)}
        disabled={this.state.animating}
        setPublicModulus={this.setPublicModulus}
        setPublicNumber={this.setPublicNumber}
        runModuloClock={this.runModuloClock}
      />
    );
  }

  renderModuloClockPanel() {
    return (
      <CharacterPanel title="Modulo clock">
        {this.renderModuloClock()}
      </CharacterPanel>
    );
  }

  renderModuloClock() {
    return (
      <ModuloClock
        ref={x => (this.moduloClock = x)}
        modulus={this.state.publicModulus || 1}
      />
    );
  }

  render() {
    const {selectedCharacter} = this.state;
    return (
      <div style={style.root}>
        <CharacterSelect
          selectedCharacter={selectedCharacter}
          onChange={this.setSelectedCharacter}
        />
        {selectedCharacter && <WidgetContinueButton />}
        {selectedCharacter && (
          <StartOverButton onClick={this.onStartOverClick} />
        )}
        <div style={style.characterViewWrapper}>
          {this.renderCharacterView(selectedCharacter)}
        </div>
      </div>
    );
  }
}

/**
 * Toggle group of character view options: Alice|Eve|Bob|All
 */
const CharacterSelect = props => (
  <span>
    <strong style={characterSelectTextStyle}>Pick a character:</strong>
    <ToggleGroup selected={props.selectedCharacter} onChange={props.onChange}>
      <button type="button" value={ALICE_VIEW}>
        <FontAwesome icon="user" /> Alice
      </button>
      <button type="button" value={EVE_VIEW}>
        <FontAwesome icon="user-secret" /> Eve
      </button>
      <button type="button" value={BOB_VIEW}>
        <FontAwesome icon="user" /> Bob
      </button>
      <button type="button" value={ALL_VIEW}>
        <FontAwesome icon="users" /> All
      </button>
    </ToggleGroup>
  </span>
);
CharacterSelect.propTypes = {
  selectedCharacter: PropTypes.string,
  onChange: PropTypes.func.isRequired
};
const characterSelectTextStyle = {
  lineHeight: '26px',
  verticalAlign: 'baseline',
  marginRight: 8
};
