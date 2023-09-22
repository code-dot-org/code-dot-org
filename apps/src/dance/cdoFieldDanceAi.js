import React from 'react';
import ReactDOM from 'react-dom';
import GoogleBlockly from 'blockly/core';
import experiments from '@cdo/apps/util/experiments';
import color from '@cdo/apps/util/color';

const FIELD_WIDTH = 32;
const FIELD_HEIGHT = 18;
const FIELD_PADDING = 2;

class CdoFieldDanceAi extends GoogleBlockly.Field {
  constructor(options) {
    super(options.currentValue);

    this.options = options;
    this.SERIALIZABLE = true;
    this.CURSOR = 'default';
    this.backgroundElement = null;
  }

  saveState() {
    return this.getValue();
  }

  loadState(state) {
    this.setValue(state);
  }

  static fromJson(options) {
    return new FieldPattern(options);
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

    this.updateSize_();
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

    /*
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
    */
  }

  renderContent() {
    if (!this.newDiv_) {
      return;
    }
  }

  dropdownDispose_() {
    this.newDiv_ = null;
  }

  hide_() {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  }

  /*
  render_() {
    if (this.backgroundElement) {
      this.backgroundElement.innerHTML = '';
    }

    GoogleBlockly.utils.dom.createSvgElement(
      'rect',
      {
        fill: color.neutral_dark,
        x: 1,
        y: 1,
        width: FIELD_WIDTH,
        height: FIELD_HEIGHT,
        rx: 3,
      },
      this.backgroundElement
    );

    const graphNotes = [];

    graphNotes.forEach(graphNote => {
      GoogleBlockly.utils.dom.createSvgElement(
        'rect',
        {
          fill: color.neutral_light,
          x: graphNote.x,
          y: graphNote.y,
          width: graphNote.width,
          height: graphNote.height,
          rx: 2,
        },
        this.backgroundElement
      );
    });

    this.renderContent();
  }
  */

  render_() {
    const FIELD_HEIGHT = 20;
    const FIELD_PADDING = 2;

    if (this.backgroundElement) {
      this.backgroundElement.innerHTML = '';
    }

    const fieldText = 'TBD';

    const constants = this.getConstants();

    // Create the text element so we can measure it.
    const textElement = GoogleBlockly.utils.dom.createSvgElement('text', {
      fill: color.neutral_light,
      x: 1,
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

    //const textWidth = 100;

    // The full width comprises:
    // 5px left margin, 15px image, 4px gap, text width, 5px right margin.
    //this.currentFieldWidth = 5 + 15 + 4 + textWidth + 5;

    // Create the background rectangle and attach it to the background
    // parent.
    GoogleBlockly.utils.dom.createSvgElement(
      'rect',
      {
        fill: color.neutral_dark90,
        x: 1,
        y: 1,
        width: textWidth,
        height: FIELD_HEIGHT,
        rx: 3,
      },
      this.backgroundElement
    );

    /*
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
    */

    // Now attach the text element to the background parent.  It will
    // render on top of the background rectangle.
    this.backgroundElement.appendChild(textElement);

    // update size
    const width = textWidth + 2 * FIELD_PADDING;
    const height = FIELD_HEIGHT + 2 * FIELD_PADDING;

    this.borderRect_?.setAttribute('width', '' + width);
    this.borderRect_?.setAttribute('height', '' + height);

    this.size_.width = width;
    this.size_.height = height;
  }

  getText() {
    return this.getValue().kit;
  }

  updateSize_() {
    const width = FIELD_WIDTH + 2 * FIELD_PADDING;
    const height = FIELD_HEIGHT + 2 * FIELD_PADDING;

    this.borderRect_?.setAttribute('width', '' + width);
    this.borderRect_?.setAttribute('height', '' + height);

    this.size_.width = width;
    this.size_.height = height;
  }
}

export default CdoFieldDanceAi;
