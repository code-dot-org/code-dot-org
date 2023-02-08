import {Triggers} from '../constants';
import Globals from '../globals';
import {
  DEFAULT_SOUND,
  EXTRA_SAMPLE_FIELD_PREFIX,
  EXTRA_SAMPLE_INPUT_PREFIX,
  FIELD_SOUNDS_TYPE,
  MINUS_IMAGE,
  PLUS_IMAGE,
  TRACK_NAME_FIELD
} from './constants';
import FieldSounds from './FieldSounds';

export const dynamicTriggerExtension = function() {
  this.getInput('trigger').appendField(
    new Blockly.FieldDropdown(function() {
      return Triggers.map(trigger => [trigger.dropdownLabel, trigger.id]);
    }),
    'trigger'
  );
};

export const getDefaultTrackNameExtension = player =>
  function() {
    this.getField(TRACK_NAME_FIELD).setValue(
      `track ${Object.keys(player.getTracksMetadata()).length + 1}`
    );
  };

export const playMultiMutator = {
  extraSampleCount_: 0,
  saveExtraState: function() {
    return {
      extraSampleCount: this.extraSampleCount_
    };
  },
  loadExtraState: function(state) {
    this.updateShape_(state.extraSampleCount);
  },
  addSound_: function() {
    this.appendDummyInput(EXTRA_SAMPLE_INPUT_PREFIX + this.extraSampleCount_)
      .setAlign(Blockly.Input.Align.RIGHT)
      .appendField('and')
      .appendField(
        new FieldSounds({
          type: FIELD_SOUNDS_TYPE,
          name: EXTRA_SAMPLE_FIELD_PREFIX + this.extraSampleCount_,
          getLibrary: () => Globals.getLibrary(),
          playPreview: (id, onStop) => {
            Globals.getPlayer().previewSound(id, onStop);
          },
          currentValue: DEFAULT_SOUND
        }),
        EXTRA_SAMPLE_FIELD_PREFIX + this.extraSampleCount_
      );
    this.extraSampleCount_++;
  },
  removeSound_: function() {
    this.extraSampleCount_--;
    this.removeInput(EXTRA_SAMPLE_INPUT_PREFIX + this.extraSampleCount_);
  },
  updateShape_: function(targetCount) {
    this.setInputsInline(targetCount < 1);
    const prevCount = this.extraSampleCount_;

    while (this.extraSampleCount_ < targetCount) {
      this.addSound_();
    }

    while (this.extraSampleCount_ > targetCount) {
      this.removeSound_();
    }

    this.showHidePlus_(this.extraSampleCount_ < 7); // upper limit?
    this.showHideMinus_(this.extraSampleCount_ > 0);
    Blockly.Events.fire(
      new Blockly.Events.BlockChange(
        this,
        'mutation',
        null,
        {extraSampleCount: prevCount},
        {extraSampleCount: this.extraSampleCount_}
      )
    );
  },
  showHidePlus_: function(shouldShow) {
    if (this.getField('PLUS')) {
      this.getField('PLUS')
        .getParentInput()
        .removeField('PLUS');
    }

    if (shouldShow) {
      this.inputList[this.inputList.length - 1].appendField(
        new Blockly.FieldImage(PLUS_IMAGE, 20, 20),
        'PLUS',
        'plus'
      );
      this.getField('PLUS').setOnClickHandler(fieldImage =>
        fieldImage.getSourceBlock().plus()
      );
    }
  },
  showHideMinus_: function(shouldShow) {
    if (this.getField('MINUS')) {
      this.getField('MINUS')
        .getParentInput()
        .removeField('MINUS');
    }

    if (shouldShow) {
      this.inputList[this.inputList.length - 1].insertFieldAt(
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
  plus: function() {
    this.updateShape_(this.extraSampleCount_ + 1);
  },
  minus: function() {
    if (this.extraSampleCount_ === 0) {
      return;
    }

    this.updateShape_(this.extraSampleCount_ - 1);
  }
};
