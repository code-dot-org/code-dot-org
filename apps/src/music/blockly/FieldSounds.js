import GoogleBlockly from 'blockly/core';
import React from 'react';
import {createRoot} from 'react-dom/client';

import color from '@cdo/apps/util/color';
import experiments from '@cdo/apps/util/experiments';

import AppConfig from '../appConfig';
import SoundStyle from '../utils/SoundStyle';
import SoundsPanel from '../views/SoundsPanel';
import SoundsPanel2 from '../views/SoundsPanel2';

const FIELD_HEIGHT = 20;
const FIELD_PADDING = 2;

// Default to using SoundsPanel, unless a URL parameter forces the use of
// the newer SoundsPanel2.
const useSoundsPanel2 = AppConfig.getValue('sounds-panel-2') === 'true';

/**
 * A custom field that renders the sample previewing and choosing UI, used in
 * various "play_sound"-related blocks. The UI is rendered by {@link SoundsPanel}.
 */
class FieldSounds extends GoogleBlockly.Field {
  constructor(options) {
    const currentValue =
      options.currentValue || options.getLibrary().getDefaultSound();

    super(currentValue);

    this.options = options;
    this.playingPreview = null;
    this.SERIALIZABLE = true;
    this.CURSOR = 'default';
    this.backgroundElement = null;
    this.currentFieldWidth = 0;
    this.showingEditor = false;
  }

  saveState() {
    return this.getValue();
  }

  loadState(state) {
    this.setValue(state);
  }

  static fromJson(options) {
    return new FieldSounds(options);
  }

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
  }

  applyColour() {
    const style = this.sourceBlock_.style;
    if (this.borderRect_) {
      this.borderRect_.setAttribute('stroke', style.colourTertiary);
      this.borderRect_.setAttribute('fill', 'transparent');
    }
    if (this.textElement_) {
      if (experiments.isEnabled('zelos')) {
        this.textElement_.style.fill = color.neutral_light;
      }
    }
  }

  showEditor_() {
    if (this.showingEditor) {
      return;
    }

    super.showEditor_();

    const editor = this.dropdownCreate_();
    Blockly.DropDownDiv.getContentDiv().appendChild(editor);

    Blockly.DropDownDiv.setColour(
      this.sourceBlock_.style.colourPrimary,
      this.sourceBlock_.style.colourTertiary
    );

    Blockly.DropDownDiv.showPositionedByField(
      this,
      this.dropdownDispose_.bind(this)
    );

    this.showingEditor = true;
  }

  dropdownCreate_() {
    this.newDiv_ = document.createElement('div');

    this.renderContent();

    this.newDiv_.style.color = color.neutral_light;
    this.newDiv_.style.width = '600px';
    this.newDiv_.style.backgroundColor = color.dark_black;
    this.newDiv_.style.padding = '5px';

    return this.newDiv_;
  }

  renderContent() {
    if (!this.newDiv_) {
      return;
    }

    const CurrentSoundsPanel = useSoundsPanel2 ? SoundsPanel2 : SoundsPanel;

    const root = createRoot(this.newDiv_);

    root.render(
      <CurrentSoundsPanel
        library={this.options.getLibrary()}
        currentValue={this.getValue()}
        playingPreview={this.playingPreview}
        showSoundFilters={this.options.getShowSoundFilters()}
        onPreview={value => {
          this.playingPreview = value;
          this.renderContent();

          this.options.playPreview(value, () => {
            // If the user starts another preview while one is
            // already playing, it will have started playing before
            // we get this stop event.  We want to wait until the
            // new preview stops before we reactivate the button, and
            // so we don't clear out this.playingPreview unless the
            // stop event coming in is for the actively playing preview.
            if (this.playingPreview === value) {
              this.playingPreview = null;
            }
            this.renderContent();
          });
        }}
        onSelect={value => this.setValue(value)}
      />
    );
  }

  dropdownDispose_() {
    this.options.cancelPreviews();

    this.newDiv_ = null;
    this.showingEditor = false;
  }

  hide_() {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  }

  render_() {
    if (this.backgroundElement) {
      this.backgroundElement.innerHTML = '';
    }

    const fieldText = this.getText();

    const constants = this.getConstants();

    // Create the text element so we can measure it.
    const textElement = GoogleBlockly.utils.dom.createSvgElement('text', {
      fill: color.neutral_light,
      x: 27,
      y: 16,
      width: 100,
      height: 20,
    });

    const soundType = this.options
      .getLibrary()
      .getSoundForId(this.getValue())?.type;

    if (soundType === 'vocal') {
      textElement.setAttribute('font-style', 'italic');
    }

    // Attach the actual text.
    textElement.appendChild(document.createTextNode(fieldText));

    // Convert our 13px font size to 9.75pt for the measurement.
    const fontSize = 9.75;

    // Measure the rendered text.
    const textWidth = GoogleBlockly.utils.dom.getFastTextWidth(
      textElement,
      fontSize,
      constants.FIELD_TEXT_FONTWEIGHT,
      constants.FIELD_TEXT_FONTFAMILY
    );

    // The full width essentially comprises:
    // 5px left margin, 17px image, 4px gap, text width, 5px right margin.
    this.currentFieldWidth = 5 + 17 + 4 + textWidth + 5;

    // Create the background rectangle and attach it to the background
    // parent.
    GoogleBlockly.utils.dom.createSvgElement(
      'rect',
      {
        fill: color.neutral_dark90,
        x: 1,
        y: 1,
        width: this.currentFieldWidth,
        height: FIELD_HEIGHT,
        rx: 3,
      },
      this.backgroundElement
    );

    let iconElement;

    // Add an icon for the sound type.
    if (soundType) {
      iconElement = GoogleBlockly.utils.dom.createSvgElement('text', {
        fill: color.neutral_light,
        x: 5 + SoundStyle[soundType].marginLeft,
        y: 16,
        width: 20,
        height: 20,
      });

      iconElement.setAttribute('style', 'font-family: "Font Awesome 6 Pro"');
      iconElement.classList.add(SoundStyle[soundType].classNameFill);

      // Attach the actual text.
      iconElement.appendChild(
        document.createTextNode(SoundStyle[soundType].iconCode)
      );
    }

    // Now attach the text element to the background parent.  It will
    // render on top of the background rectangle.
    this.backgroundElement.appendChild(textElement);

    // Similarly, add the icon text element to the background parent.
    if (iconElement) {
      this.backgroundElement.appendChild(iconElement);
    }

    // Update the field size.
    this.updateSize_();

    // Possibly render the panel contents.
    this.renderContent();
  }

  getText() {
    return this.options.getLibrary().getSoundForId(this.getValue())?.name || '';
  }

  updateSize_() {
    const width = this.currentFieldWidth + 2 * FIELD_PADDING;
    const height = FIELD_HEIGHT + 2 * FIELD_PADDING;

    this.borderRect_?.setAttribute('width', '' + width);
    this.borderRect_?.setAttribute('height', '' + height);

    this.size_.width = width;
    this.size_.height = height;
  }
}

export default FieldSounds;
