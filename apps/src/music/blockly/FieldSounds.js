import React from 'react';
import ReactDOM from 'react-dom';
import SoundsPanel from '../views/SoundsPanel';
import GoogleBlockly from 'blockly/core';
import experiments from '@cdo/apps/util/experiments';
import color from '@cdo/apps/util/color';

const FIELD_HEIGHT = 20;
const FIELD_PADDING = 2;

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
  }

  dropdownCreate_() {
    this.newDiv_ = document.createElement('div');

    this.renderContent();

    this.newDiv_.style.color = color.neutral_light;
    this.newDiv_.style.width = '300px';
    this.newDiv_.style.backgroundColor = color.dark_black;
    this.newDiv_.style.padding = '5px';
    this.newDiv_.style.cursor = 'pointer';

    return this.newDiv_;
  }

  renderContent() {
    if (!this.newDiv_) {
      return;
    }

    ReactDOM.render(
      <SoundsPanel
        library={this.options.getLibrary()}
        currentValue={this.getValue()}
        playingPreview={this.playingPreview}
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
        onSelect={value => {
          this.setValue(value);
          this.hide_();
        }}
      />,
      this.newDiv_
    );
  }

  dropdownDispose_() {
    this.newDiv_ = null;
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
      x: 25,
      y: 16,
      width: 100,
      height: 20,
    });

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

    // The full width comprises:
    // 5px left margin, 15px image, 4px gap, text width, 5px right margin.
    this.currentFieldWidth = 5 + 15 + 4 + textWidth + 5;

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

    // Add an image for the sound type.
    const soundType = this.options
      .getLibrary()
      .getSoundForId(this.getValue()).type;

    GoogleBlockly.utils.dom.createSvgElement(
      'image',
      {
        x: 6,
        y: 3,
        width: 15,
        href: `/blockly/media/music/icon-${soundType}.png`,
      },
      this.backgroundElement
    );

    // Now attach the text element to the background parent.  It will
    // render on top of the background rectangle.
    this.backgroundElement.appendChild(textElement);

    // Update the field size.
    this.updateSize_();

    // Possibly render the panel contents.
    this.renderContent();
  }

  getText() {
    return this.options.getLibrary().getSoundForId(this.getValue()).name;
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
