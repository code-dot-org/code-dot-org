import React from 'react';
import ReactDOM from 'react-dom';
import PatternPanel from '../views/PatternPanel';
import GoogleBlockly from 'blockly/core';
import experiments from '@cdo/apps/util/experiments';

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
  }

  applyColour() {
    const style = this.sourceBlock_.style;
    if (this.borderRect_) {
      this.borderRect_.setAttribute('stroke', style.colourTertiary);
      this.borderRect_.setAttribute('fill', 'transparent');
    }
    if (this.textElement_) {
      if (experiments.isEnabled('zelos')) {
        this.textElement_.style.fill = 'white';
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

    this.newDiv_.style.color = 'white';
    this.newDiv_.style.width = '400px';
    this.newDiv_.style.backgroundColor = 'black';
    this.newDiv_.style.padding = '5px';

    return this.newDiv_;
  }

  renderContent() {
    if (!this.newDiv_) {
      return;
    }

    ReactDOM.render(
      <PatternPanel
        library={this.options.getLibrary()}
        initValue={this.getValue()}
        onChange={value => {
          this.setValue(value);
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
    super.render_();
    this.renderContent();
  }

  getText() {
    return this.getValue().kit;
  }
}

export default FieldPattern;
