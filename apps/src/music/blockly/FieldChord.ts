import React from 'react';
import ReactDOM from 'react-dom';
import ChordPanel, {ChordPanelProps} from '../views/ChordPanel';
import {BlockSvg, DropDownDiv, Field, WidgetDiv} from 'blockly/core';
import {ChordEventValue} from '../player/interfaces/ChordEvent';
import MusicLibrary from '../player/MusicLibrary';
import {getNoteName} from '../utils/Notes';
import GoogleBlockly from 'blockly/core';
import {generateGraphDataFromChord, ChordGraphNote} from '../utils/Chords';
const experiments = require('@cdo/apps/util/experiments');

const MAX_DISPLAY_NOTES = 3;

interface FieldChordOptions {
  getLibrary: () => MusicLibrary;
  previewChord: (value: ChordEventValue) => void;
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
  private movableGroup_: SVGGraphicsElement | null;

  constructor(options: FieldChordOptions) {
    super(options.currentValue);

    this.options = options;
    this.newDiv = null;
    this.SERIALIZABLE = true;
    this.CURSOR = 'default';
    this.movableGroup_ = null;
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
    //super.render_();

    this.movableGroup_ = GoogleBlockly.utils.dom.createSvgElement(
      'g',
      {
        transform: 'translate(1,1)'
      },
      this.fieldGroup_
    ) as SVGGraphicsElement;

    const backingRectangle = GoogleBlockly.utils.dom.createSvgElement('rect',
    {
      'fill': '#54595e',
      'x': 1,
      'y': 1,
      'width': 86,
      'height': 18
    }, this.movableGroup_);

    const graphNotes: ChordGraphNote[] = generateGraphDataFromChord(
      {
        notes: this.getValue().notes,
        playStyle: this.getValue().playStyle,
        instrument: ''
      } as ChordEventValue,
      86,
      18,
      3,
      4
    );

    graphNotes.forEach(graphNote => {
      GoogleBlockly.utils.dom.createSvgElement('rect',
      {
        'fill': '#59b9dc',
        'x': graphNote.x,
        'y': graphNote.y,
        'width': graphNote.width,
        'height': graphNote.height
      }, this.movableGroup_);
    });

    /*
    const value = this.getValue();

    for (let i = 0; i < 16; i++) {
      const x = i * 86/16;
      const y = 18 - ((value.notes[i % value.notes.length] - 4 * 12) * 18 / 3 / 13);

      GoogleBlockly.utils.dom.createSvgElement('rect',
      {
        'fill': '#59b9dc',
        'x': x,
        'y': y,
        'width': 4,
        'height': 2
      }, this.movableGroup_);
    }
    */

    this.updateSize_();

    this.renderContent();
  }

  updateSize_() {
    const width = 90;
    const height = 22;

    this.borderRect_?.setAttribute('width', '' + width);
    this.borderRect_?.setAttribute('height', '' + height);

    this.size_.width = width;
    this.size_.height = height;

    /*
    const bbox = this.movableGroup_?.getBBox();
    if (bbox?.width && bbox?.height) {
      let width = bbox.width;
      let height = bbox.height;
      if (width && height && this.borderRect_) {
        //width += this.constants_.FIELD_BORDER_RECT_X_PADDING * 2;
        //height += this.constants_.FIELD_BORDER_RECT_X_PADDING * 2;
        width += 5 * 2;
        height += 5 * 2;
        this.borderRect_.setAttribute('width', '' + width);
        this.borderRect_.setAttribute('height', '' + height);
      }
      // Note how both the width and the height can be dynamic.
      this.size_.width = width;
      this.size_.height = height;
    }*/

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
    this.newDiv.style.height = 'auto';
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
