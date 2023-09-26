import GoogleBlockly from 'blockly/core';
import experiments from '@cdo/apps/util/experiments';
import color from '@cdo/apps/util/color';
import {getStore} from '../redux';
import {setShowingAi} from './danceRedux';

const FIELD_WIDTH = 32;
const FIELD_HEIGHT = 18;
const FIELD_PADDING = 2;

class CdoFieldDanceAi extends GoogleBlockly.Field {
  constructor(options) {
    super();

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
    return new CdoFieldDanceAi(options);
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
    getStore().dispatch(setShowingAi(this));
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
