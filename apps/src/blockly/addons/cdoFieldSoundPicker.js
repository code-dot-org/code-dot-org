import React from 'react';
import ReactDOM from 'react-dom';
import GoogleBlockly from 'blockly/core';
import Sounds from '@cdo/apps/Sounds';
import Dialog from '@cdo/apps/code-studio/LegacyDialog';
import loadable from '@cdo/apps/util/loadable';
import {RecordingFileType} from '@cdo/apps/code-studio/components/recorders';
import {
  exceedsAbuseThreshold,
  getCurrentId,
} from '@cdo/apps/code-studio/initApp/project';

const ImagePicker = loadable(() =>
  import('@cdo/apps/code-studio/components/ImagePicker')
);
const SoundPicker = loadable(() =>
  import('@cdo/apps/code-studio/components/SoundPicker')
);

const FIELD_WIDTH = 100;
const FIELD_HEIGHT = 20;
const FIELD_PADDING = 2;

/**
 * A custom field that renders the sound picker
 */
class CdoFieldSoundPicker extends GoogleBlockly.Field {
  constructor(value, options) {
    super(value);
    console.log('options', options);
    this.assetChosen = options.assetChosen;
    this.typeFilter = options.typeFilter;
    this.onClose = options.onClose;
    this.options = options.options;
    this.newDiv = null;
    this.SERIALIZABLE = true;
    this.CURSOR = 'default';
    this.backgroundElement = null;
  }

  /**
   * Saves this fields value as something which can be serialized to JSON.
   * Should only be called by the serialization system.
   * @override
   * @returns JSON serializable state.
   */
  saveState() {
    return this.getValue();
  }
  /**
   * Sets the field's state based on the given state value. Should only be
   * called by the serialization system.
   * @override
   * @param state The state we want to apply to the field.
   * @internal
   */
  loadState(state) {
    this.setValue(state);
  }

  static fromJson(options) {
    return new CdoFieldSoundPicker(options);
  }

  /**
   * Create the block UI for this field.
   *
   * @override
   */
  initView() {
    this.createBorderRect_();
    this.createTextElement_();
    if (this.borderRect_) {
      this.borderRect_.classList.add('blocklyDropdownRect');
    }

    this.backgroundElement = GoogleBlockly.utils.dom.createSvgElement(
      'g',
      {
        transform: 'translate(1,1)',
      },
      this.fieldGroup_
    );

    this.updateSize_(); // this is in FieldChord
  }

  /**
   * Updates the field to match the colour/style of the block.
   * @override
   */
  applyColour() {
    const style = this.sourceBlock_.style;
    if (this.borderRect_) {
      this.borderRect_.setAttribute('stroke', style.colourTertiary);
      this.borderRect_.setAttribute('fill', 'transparent');
    }
  }

  // getText() {
  //   return this.options.getLibrary().getSoundForId(this.getValue()).name;
  // }

  /**
   * An editor for the field.
   * @override
   */
  showEditor_(e) {
    super.showEditor_();

    const editor = this.dropdownCreate_();
    Blockly.DropDownDiv.getContentDiv().appendChild(editor);

    const style = this.sourceBlock_.style;
    Blockly.DropDownDiv.setColour(style.colourPrimary, style.colourTertiary);

    // Blockly.DropDownDiv.showPositionedByField(
    //   this,
    //   this.disposeDropdown.bind(this)
    // );
  }

  dropdownCreate_() {
    console.log('inside dropdownCreate_');
    this.newDiv_ = document.createElement('div');

    this.renderContent();

    this.newDiv_.style.color = 'white';
    this.newDiv_.style.width = '100px';
    this.newDiv_.style.backgroundColor = 'black';
    this.newDiv_.style.padding = '5px';
    this.newDiv_.style.cursor = 'pointer';

    return this.newDiv_;
  }

  renderContent() {
    console.log('in renderContent - this.newDiv_', this.newDiv_);
    if (!this.newDiv_) {
      return;
    }

    let sounds = new Sounds();
    this.newDiv = document.createElement('div');
    let showChoseImageButton =
      this.assetChosen && typeof assetChosen === 'function';
    let dialog = new Dialog({
      body: this.newDiv,
      id: 'manageAssetsModal',
      onHidden: () => {
        sounds.stopAllAudio();
        if (this.onClose) {
          this.onClose();
        }
      },
    });

    let pickerType = this.typeFilter === 'audio' ? SoundPicker : ImagePicker;

    ReactDOM.render(
      React.createElement(pickerType, {
        typeFilter: this.typeFilter,
        uploadsEnabled: !exceedsAbuseThreshold(),
        assetChosen: showChoseImageButton
          ? function (fileWithPath, timestamp) {
              dialog.hide();
              this.assetChosen(fileWithPath, timestamp);
            }
          : null,
        projectId: getCurrentId(),
        soundPlayer: sounds,
        recordingFileType: RecordingFileType.MP3,
        libraryOnly: this.options.libraryOnly,
        currentValue: this.currentValue,
        showUnderageWarning: false,
        useFilesApi: false,
      }),
      this.newDiv
    );
    console.log('after createElement - this.newDiv', this.newDiv);
  }

  dropdownDispose_() {
    this.newDiv_ = null;
  }

  hide_() {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  }

  /**
   * render_ is called on in getSize which returns the height and width of the field
   * @override
   */
  render_() {
    if (this.backgroundElement) {
      this.backgroundElement.innerHTML = '';
    }
    this.renderContent();
  }

  getText_() {}

  /**
   * Updates the size of the field based on the text.
   * @override
   * @param margin margin to use when positioning the text element.
   */
  updateSize_() {
    const width = FIELD_WIDTH + 2 * FIELD_PADDING;
    const height = FIELD_HEIGHT + 2 * FIELD_PADDING;

    this.borderRect_?.setAttribute('width', '' + width);
    this.borderRect_?.setAttribute('height', '' + height);

    this.size_.width = width;
    this.size_.height = height;
  }
}

export default CdoFieldSoundPicker;
