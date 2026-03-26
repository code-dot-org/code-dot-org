/** @file Root component for Public Key Cryptography widget */
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';

import WidgetContinueButton from '../templates/WidgetContinueButton';
import color from '../util/color';

import Alice from './Alice';
import AliceInstructions from './AliceInstructions';
import Bob from './Bob';
import BobInstructions from './BobInstructions';
import CharacterPanel from './CharacterPanel';
import EqualColumns from './EqualColumns';
import Eve from './Eve';
import EveInstructions from './EveInstructions';
import ModuloClock from './ModuloClock';
import StartOverButton from './StartOverButton';

import legacyStyles from '@cdo/apps/templates/legacy-toggle-styles.module.scss';

// Magic strings for view modes
const ALICE_VIEW = 'alice';
const EVE_VIEW = 'eve';
const BOB_VIEW = 'bob';
const ALL_VIEW = 'all';

const style = {
  root: {
    ...fontConstants['main-font-regular'],
    marginTop: 10,
  },
  characterViewWrapper: {
    clear: 'both',
    marginTop: 10,
  },
  noCharacterSelected: {
    textAlign: 'center',
    padding: '100px 0',
    fontSize: 'x-large',
    color: color.light_gray,
  },
};

/** Root component for Public Key Cryptography widget */
export default class PublicKeyCryptographyWidget extends React.Component {
  state = {
    animating: false,
    publicModulus: null,
    selectedCharacter: null,
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
  <div style={characterSelectWrapperStyle}>
    <strong style={characterSelectTextStyle}>Pick a character:</strong>
    <SegmentedButtons
      selectedButtonValue={props.selectedCharacter}
      onChange={props.onChange}
      className={legacyStyles.legacyToggle}
      buttons={[
        {
          value: ALICE_VIEW,
          label: 'Alice',
          iconLeft: {iconName: 'user', iconStyle: 'solid'},
        },
        {
          value: EVE_VIEW,
          label: 'Eve',
          iconLeft: {iconName: 'user-secret', iconStyle: 'solid'},
        },
        {
          value: BOB_VIEW,
          label: 'Bob',
          iconLeft: {iconName: 'user', iconStyle: 'solid'},
        },
        {
          value: ALL_VIEW,
          label: 'All',
          iconLeft: {iconName: 'users', iconStyle: 'solid'},
        },
      ]}
    />
  </div>
);
CharacterSelect.propTypes = {
  selectedCharacter: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
const characterSelectWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};
const characterSelectTextStyle = {
  lineHeight: '26px',
};
