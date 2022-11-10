import React from 'react';
import ReactDOM from 'react-dom';
import SoundsPanel from './SoundsPanel';
import GoogleBlockly from 'blockly/core';

class FieldSounds extends GoogleBlockly.Field {
  constructor(options) {
    super(options.currentValue);

    this.options = options;
    this.playingPreview = null;
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
    return new FieldSounds(options);
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
      this.textElement_.style.fill = 'white';
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
    this.newDiv_.style.width = '300px';
    this.newDiv_.style.backgroundColor = 'black';
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
    super.render_();
    this.renderContent();
  }
}

export default FieldSounds;
