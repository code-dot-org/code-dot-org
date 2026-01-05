import * as Blockly from 'blockly/core';
import React from 'react';
import {createRoot} from 'react-dom/client';

import {PluginType} from '@code-dot-org/blockly-workspace/plugins';
import type {FieldPlugin} from '@code-dot-org/blockly-workspace/plugins';
import {experiments} from '@code-dot-org/metrics';

import ChordPanel from '../../components/chordPanel';
import type {ChordPanelProps} from '../../components/chordPanel';
import type {ChordEventValue} from '../../player/interfaces/ChordEvent';
import type {ChordGraphNote} from '../../utils/Chords';
import {generateGraphDataFromChord} from '../../utils/Chords';
import {getNoteName} from '../../utils/Notes';

const MAX_DISPLAY_NOTES = 3;
const FIELD_WIDTH = 51;
const FIELD_HEIGHT = 18;
const FIELD_PADDING = 2;

const getCSSVariable: (name: string) => string = name =>
  typeof window !== 'undefined'
    ? window.getComputedStyle(document.body).getPropertyValue(`--${name}`) || ''
    : '';

interface FieldChordOptions {
  currentValue: ChordEventValue;
}

/**
 * A custom field that renders the chord selection UI, used in the
 * "play_chord" block. The UI is rendered by {@link ChordPanel}.
 */
export class FieldChord extends Blockly.Field {
  static fromJson(_options: Blockly.FieldConfig) {
    const options = _options as FieldChordOptions;
    return new FieldChord(options);
  }

  protected options: FieldChordOptions;
  private newDiv: HTMLDivElement | null;
  private root: ReturnType<typeof createRoot> | null;
  private backgroundElement: SVGGraphicsElement | null;

  constructor(options: FieldChordOptions) {
    super(options.currentValue);

    this.options = options;
    this.newDiv = null;
    this.root = null;
    this.SERIALIZABLE = true;
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
      Blockly.utils.dom.createSvgElement<SVGGraphicsElement>(
        'g',
        {
          transform: 'translate(1,1)',
        },
        this.fieldGroup_,
      );

    this.updateSize_();
  }

  applyColour() {
    const style = (this.sourceBlock_ as Blockly.BlockSvg).style;
    if (this.borderRect_) {
      this.borderRect_.setAttribute('stroke', style.colourTertiary);
      this.borderRect_.setAttribute('fill', 'transparent');
    }
    if (this.textElement_) {
      if (experiments.isEnabled(experiments.Experiment.ZELOS)) {
        this.textElement_.style.fill = getCSSVariable('neutral-gray-5');
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

    Blockly.utils.dom.createSvgElement(
      'rect',
      {
        fill: getCSSVariable('neutral-gray-20'),
        x: 1,
        y: 1,
        width: FIELD_WIDTH,
        height: FIELD_HEIGHT,
        rx: 3,
      },
      this.backgroundElement,
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
      Blockly.utils.dom.createSvgElement(
        'rect',
        {
          fill: getCSSVariable('brand-aqua-40'),
          x: graphNote.x,
          y: graphNote.y,
          width: graphNote.width,
          height: graphNote.height,
          rx: 1,
        },
        this.backgroundElement,
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
    Blockly.DropDownDiv.getContentDiv().appendChild(editor);

    const style = (this.sourceBlock_ as Blockly.BlockSvg).style;
    Blockly.DropDownDiv.setColour(style.colourPrimary, style.colourTertiary);

    Blockly.DropDownDiv.showPositionedByField(
      this,
      this.disposeDropdown.bind(this),
    );
  }

  private createDropdown(): HTMLDivElement {
    this.newDiv = document.createElement('div');

    this.renderContent();

    this.newDiv.style.color = getCSSVariable('neutral-gray-5');
    this.newDiv.style.width = 'auto';
    this.newDiv.style.backgroundColor = getCSSVariable('neutral-gray-99');
    this.newDiv.style.padding = '5px';

    return this.newDiv;
  }

  private renderContent(): void {
    if (!this.newDiv) {
      return;
    }

    this.root = createRoot(this.newDiv);
    this.root.render(
      React.createElement<ChordPanelProps>(ChordPanel, {
        initValue: this.getValue(),
        onChange: this.onValueChange,
      }),
    );
  }

  private disposeDropdown() {
    this.root?.unmount();
    this.newDiv = null;
    this.root = null;
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

export const plugin: FieldPlugin = {
  type: PluginType.Field,
  name: 'field_chord',
  field: FieldChord,
};

export default plugin;
