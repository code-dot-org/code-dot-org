import {TICKS_PER_MEASURE} from '../constants';
import MusicLibrary from '../player/MusicLibrary';

import {BlockTypes} from './blockTypes';
import {
  EXTRA_SOUND_INPUT_PREFIX,
  MINUS_IMAGE,
  PLUS_IMAGE,
  SOUND_VALUE_TYPE,
  TRACK_NAME_FIELD,
  FIELD_EFFECTS_NAME,
  FIELD_EFFECTS_VALUE,
  FIELD_EFFECTS_VALUE_OPTIONS,
  DEFAULT_EFFECT_VALUE,
  FIELD_SOUNDS_NAME,
  FIELD_PATTERN_NAME,
  FIELD_PATTERN_AI_NAME,
} from './constants';

export const getDefaultTrackNameExtension = player =>
  function () {
    this.getField(TRACK_NAME_FIELD).setValue(
      `track 1` // TODO: Replace with Sequencer output when re-enabling Tracks mode
    );
  };

export const playMultiMutator = {
  extraSoundInputCount_: 0,
  saveExtraState: function () {
    return {
      extraSoundInputCount: this.extraSoundInputCount_,
    };
  },
  loadExtraState: function (state) {
    this.updateShape_(state.extraSoundInputCount);
  },
  addSound_: function () {
    const shadowBlockXml = `<shadow type="${BlockTypes.VALUE_SAMPLE}"/>`;
    this.appendValueInput(EXTRA_SOUND_INPUT_PREFIX + this.extraSoundInputCount_)
      .setShadowDom(Blockly.Xml.textToDom(shadowBlockXml))
      .setAlign(Blockly.Input.Align.RIGHT)
      .setCheck(SOUND_VALUE_TYPE)
      .appendField('and');

    this.extraSoundInputCount_++;
  },
  removeSound_: function () {
    this.extraSoundInputCount_--;
    this.removeInput(EXTRA_SOUND_INPUT_PREFIX + this.extraSoundInputCount_);
  },
  updateShape_: function (targetCount) {
    this.setInputsInline(targetCount < 1);
    const prevCount = this.extraSoundInputCount_;

    while (this.extraSoundInputCount_ < targetCount) {
      this.addSound_();
    }

    while (this.extraSoundInputCount_ > targetCount) {
      this.removeSound_();
    }

    this.showHidePlus_(this.extraSoundInputCount_ < 7); // upper limit?
    this.showHideMinus_(this.extraSoundInputCount_ > 0);
    Blockly.Events.fire(
      new Blockly.Events.BlockChange(
        this,
        'mutation',
        null,
        {extraSoundInputCount: prevCount},
        {extraSoundInputCount: this.extraSoundInputCount_}
      )
    );
  },
  showHidePlus_: function (shouldShow) {
    if (this.getInput('PLUS')) {
      this.removeInput('PLUS');
    }

    if (shouldShow) {
      this.appendDummyInput('PLUS').appendField(
        new Blockly.FieldImage(PLUS_IMAGE, 20, 20),
        'PLUS',
        'plus'
      );
      this.getField('PLUS').setOnClickHandler(fieldImage =>
        fieldImage.getSourceBlock().plus()
      );
    }
  },
  showHideMinus_: function (shouldShow) {
    if (this.getField('MINUS')) {
      this.getField('MINUS').getParentInput().removeField('MINUS');
    }

    if (shouldShow) {
      // Try to insert minus before last sample input (not plus)
      let input = this.inputList[this.inputList.length - 1];
      if (input.name === 'PLUS') {
        input = this.inputList[this.inputList.length - 2];
      }
      input.insertFieldAt(
        0,
        new Blockly.FieldImage(MINUS_IMAGE, 20, 20),
        'MINUS',
        'minus'
      );
      this.getField('MINUS').setOnClickHandler(fieldImage =>
        fieldImage.getSourceBlock().minus()
      );
    }
  },
  plus: function () {
    this.updateShape_(this.extraSoundInputCount_ + 1);
  },
  minus: function () {
    if (this.extraSoundInputCount_ === 0) {
      return;
    }

    this.updateShape_(this.extraSoundInputCount_ - 1);
  },
};

/*
 * Extension for the effects field, which replaces the input_dummy in the block
 * with a dynamic field_dropdown and updates the effect value dropdown
 * based on the selected effect name.
 */
export const effectsFieldExtension = function () {
  // Set the initial state when the block gets created
  const thisBlock = this;
  const valuesDropdown = new Blockly.FieldDropdown(function () {
    return FIELD_EFFECTS_VALUE_OPTIONS[
      thisBlock.getFieldValue(FIELD_EFFECTS_NAME)
    ];
  });
  valuesDropdown.setValue(DEFAULT_EFFECT_VALUE);
  this.getInput(FIELD_EFFECTS_VALUE).appendField(
    valuesDropdown,
    FIELD_EFFECTS_VALUE
  );

  // Set up handler to update the effect value when the effect name changes
  const fieldEffectsName = this.getField(FIELD_EFFECTS_NAME);

  // Override the default onItemSelected_ handler
  const baseHandler = fieldEffectsName.onItemSelected_;
  fieldEffectsName.onItemSelected_ = (menu, menuItem) => {
    // Update the effect value dropdown's options to match the newly selected effect
    const selectedEffectName = menuItem.opt_value;
    const effectValueField = this.getField(FIELD_EFFECTS_VALUE);
    effectValueField.menuGenerator_ =
      FIELD_EFFECTS_VALUE_OPTIONS[selectedEffectName];
    effectValueField.setValue(DEFAULT_EFFECT_VALUE);

    baseHandler.call(fieldEffectsName, menu, menuItem);
  };
};

/**
 * Extension to blocks with sound fields that validates new values.
 */
export const fieldSoundsValidator = function () {
  /**
   * Ensures that sound blocks also have a valid value, even if a level's library or song
   * pack has changed.
   * @param newValue The sound id selected from the field editor or initial sources.
   * @returns The new sound id or, if that's invalid, the id for the first available sound
   */
  this.getField(FIELD_SOUNDS_NAME).setValidator(newValue => {
    const libraryInstance = MusicLibrary.getInstance();
    if (libraryInstance) {
      const soundDataForValue = libraryInstance.getSoundForId(newValue);
      const defaultSoundData = libraryInstance.getDefaultSound();
      if (!soundDataForValue) {
        console.warn(
          `A sound field value was reset. ${newValue} was not found in the current library.`
        );
        return defaultSoundData;
      } else if (!libraryInstance.isSoundIdAvailable(newValue)) {
        console.warn(
          `A sound field value was reset. ${newValue} was not found in the available sound packs.`
        );
        return defaultSoundData;
      }
    }
    return newValue;
  });
};

/**
 * Extension to blocks with pattern fields that validates new values.
 */
export const fieldPatternsValidator = function () {
  // A block may have a pattern field or pattern AI field, but should not have both.
  const patternField =
    this.getField(FIELD_PATTERN_NAME) || this.getField(FIELD_PATTERN_AI_NAME);

  /**
   * Removes invalid event notes from pattern field values.
   * @param newValue The new instrument event value
   * @returns The modified instrument event value
   */
  patternField?.setValidator(newValue => {
    const kitNotes = MusicLibrary.getInstance()
      .kits.find(kit => kit.id === newValue.instrument)
      .sounds.map(sound => sound.note);
    newValue.events = newValue.events.filter(
      event =>
        // Remove events with notes that not part of the current kit's sounds. (Ex. 1...8)
        kitNotes.includes(event.note) &&
        // Remove event with ticks that are outside the expected tick range.
        event.tick <= newValue.length * TICKS_PER_MEASURE
    );
    return newValue;
  });
};
