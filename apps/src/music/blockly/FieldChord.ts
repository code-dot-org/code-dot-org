import React from 'react';
import ReactDOM from 'react-dom';
import ChordPanel, {ChordPanelProps} from '../views/ChordPanel';
import GoogleBlockly, {BlockSvg, DropDownDiv, Field} from 'blockly/core';
import {ChordEventValue} from '../player/interfaces/ChordEvent';
import MusicLibrary from '../player/MusicLibrary';
import {getNoteName} from '../utils/Notes';
import {generateGraphDataFromChord, ChordGraphNote} from '../utils/Chords';
import experiments from '@cdo/apps/util/experiments';
import color from '@cdo/apps/util/color';

const MAX_DISPLAY_NOTES = 3;
const FIELD_WIDTH = 51;
const FIELD_HEIGHT = 18;
const FIELD_PADDING = 2;

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
  private backgroundElement: SVGGraphicsElement | null;

  constructor(options: FieldChordOptions) {
    super(options.currentValue);

    this.options = options;
    this.newDiv = null;
    this.SERIALIZABLE = true;
    this.CURSOR = 'default';
    this.backgroundElement = null;
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

    this.backgroundElement =
      GoogleBlockly.utils.dom.createSvgElement<SVGGraphicsElement>(
        'g',
        {
          transform: 'translate(1,1)',
        },
        this.fieldGroup_
      );

    this.updateSize_();
  }

  applyColour() {
    const style = (this.sourceBlock_ as BlockSvg).style;
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

  getText() {
    const {notes, instrument} = this.getValue();
    if (notes.length === 0) {
      return 'select notes';
    }

    return `${instrument} (${this.getTruncatedNotes(notes)})`;
  }

  protected render_() {
    if (this.backgroundElement) {
      this.backgroundElement.innerHTML = '';
    }

    GoogleBlockly.utils.dom.createSvgElement(
      'rect',
      {
        fill: color.neutral_dark90,
        x: 1,
        y: 1,
        width: FIELD_WIDTH,
        height: FIELD_HEIGHT,
        rx: 3,
      },
      this.backgroundElement
    );

    const graphNotes: ChordGraphNote[] = generateGraphDataFromChord({
      chordEventValue: this.getValue(),
      width: FIELD_WIDTH,
      height: FIELD_HEIGHT,
      numOctaves: 3,
      startOctave: 4,
      padding: 2,
      noteHeightScale: 4,
    });

    graphNotes.forEach(graphNote => {
      GoogleBlockly.utils.dom.createSvgElement(
        'rect',
        {
          fill: color.light_cyan,
          x: graphNote.x,
          y: graphNote.y,
          width: graphNote.width,
          height: graphNote.height,
          rx: 1,
        },
        this.backgroundElement
      );
    });

    this.renderContent();
  }

  updateSize_() {
    const width = FIELD_WIDTH + 2 * FIELD_PADDING;
    const height = FIELD_HEIGHT + 2 * FIELD_PADDING;

    this.borderRect_?.setAttribute('width', '' + width);
    this.borderRect_?.setAttribute('height', '' + height);

    this.size_.width = width;
    this.size_.height = height;
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

    this.newDiv.style.color = color.neutral_light;
    this.newDiv.style.width = 'auto';
    this.newDiv.style.backgroundColor = color.dark_black;
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
        onChange: this.onValueChange,
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

  private onValueChange = (value: ChordEventValue) => this.setValue(value);
}
