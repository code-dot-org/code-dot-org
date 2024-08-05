import GoogleBlockly from 'blockly/core';
import React from 'react';
import {createRoot} from 'react-dom/client';

import color from '@cdo/apps/util/color';
import experiments from '@cdo/apps/util/experiments';

import {generateGraphDataFromPattern} from '../utils/Patterns';
import PatternPanel from '../views/PatternPanel';

const FIELD_WIDTH = 32;
const FIELD_HEIGHT = 18;
const FIELD_PADDING = 2;

/**
 * A custom field that renders the pattern editing UI, used in the
 * "play_pattern" block. The UI is rendered by {@link PatternPanel}.
 */
class FieldPattern extends GoogleBlockly.Field {
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
    this.newDiv_.style.width = '420px';
    this.newDiv_.style.backgroundColor = color.dark_black;
    this.newDiv_.style.padding = '5px';

    return this.newDiv_;
  }

  renderContent() {
    if (!this.newDiv_) {
      return;
    }

    const root = createRoot(this.newDiv_);

    root.render(
      <PatternPanel
        library={this.options.getLibrary()}
        initValue={this.getValue()}
        onChange={value => {
          this.setValue(value);
        }}
        {...this.options}
      />
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

    const graphNotes = generateGraphDataFromPattern({
      patternEventValue: this.getValue(),
      width: FIELD_WIDTH,
      height: FIELD_HEIGHT,
      padding: FIELD_PADDING,
      eventScale: 2,
      library: this.options.getLibrary(),
    });

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

export default FieldPattern;
