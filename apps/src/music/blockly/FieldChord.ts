import React from 'react';
import ReactDOM from 'react-dom';
import ChordPanel, {ChordPanelProps} from '../views/ChordPanel';
import {BlockSvg, DropDownDiv, Field, WidgetDiv} from 'blockly/core';
import {ChordEventValue} from '../player/interfaces/ChordEvent';
import MusicLibrary from '../player/MusicLibrary';
import {getNoteName} from '../utils/Notes';
const experiments = require('@cdo/apps/util/experiments');

const MAX_DISPLAY_NOTES = 3;

interface FieldChordOptions {
  getLibrary: () => MusicLibrary;
  previewChord: (value: ChordEventValue) => void;
  previewNote: (note: number, instrument: string, onStop?: () => void) => void;
  cancelPreviews: () => void;
  currentValue: ChordEventValue;
}

/**
 * A custom field that renders the chord selection UI, used in the
 * "play_chord" block. The UI is rendered by {@link ChordPanel}.
 */
export default class FieldChord extends Field {
  static fromJson(options: FieldChordOptions) {
    return new FieldChord(options);
  }

  private options: FieldChordOptions;
  private newDiv: HTMLDivElement | null;

  constructor(options: FieldChordOptions) {
    super(options.currentValue);

    this.options = options;
    this.newDiv = null;
    this.SERIALIZABLE = true;
    this.CURSOR = 'default';
  }

  saveState() {
    return this.getValue();
  }

  loadState(state: ChordEventValue) {
    this.setValue(state);
  }

  initView() {
    this.createBorderRect_();
    this.createTextElement_();
    if (this.borderRect_) {
      this.borderRect_.classList.add('blocklyDropdownRect');
    }
  }

  applyColour() {
    const style = (this.sourceBlock_ as BlockSvg).style;
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

  getText() {
    const {notes, instrument} = this.getValue();
    if (notes.length === 0) {
      return 'select notes';
    }

    return `${instrument} (${this.getTruncatedNotes(notes)})`;
  }

  protected render_() {
    super.render_();
    this.renderContent();
  }

  protected showEditor_() {
    super.showEditor_();

    const editor = this.createDropdown();
    DropDownDiv.getContentDiv().appendChild(editor);

    const style = (this.sourceBlock_ as BlockSvg).style;
    DropDownDiv.setColour(style.colourPrimary, style.colourTertiary);

    DropDownDiv.showPositionedByField(this, this.disposeDropdown.bind(this));
  }

  private createDropdown(): HTMLDivElement {
    this.newDiv = document.createElement('div');

    this.renderContent();

    this.newDiv.style.color = 'white';
    this.newDiv.style.width = 'auto';
    this.newDiv.style.backgroundColor = 'black';
    this.newDiv.style.padding = '5px';

    return this.newDiv;
  }

  private renderContent(): void {
    if (!this.newDiv) {
      return;
    }

    ReactDOM.render(
      React.createElement<ChordPanelProps>(ChordPanel, {
        library: this.options.getLibrary(),
        initValue: this.getValue(),
        previewChord: this.options.previewChord,
        previewNote: this.options.previewNote,
        cancelPreviews: this.options.cancelPreviews,
        onChange: value => this.setValue(value)
      }),
      this.newDiv
    );
  }

  private disposeDropdown() {
    this.newDiv = null;
  }

  private getTruncatedNotes(notes: number[]): string {
    const allNotes = notes
      .map(note => getNoteName(note))
      .slice(0, MAX_DISPLAY_NOTES)
      .join(', ');
    return notes.length > MAX_DISPLAY_NOTES ? allNotes + '...' : allNotes;
  }
}
