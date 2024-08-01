import GoogleBlockly, {BlockSvg, DropDownDiv, Field} from 'blockly/core';
import React from 'react';
import ReactDOM from 'react-dom';

import {TuneEventValue} from '../player/interfaces/TuneEvent';
import MusicLibrary from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';
import {getNoteName} from '../utils/Notes';
import {generateGraphDataFromTune, TuneGraphEvent} from '../utils/Tunes';
import TunePanel, {TunePanelProps} from '../views/TunePanel';

const color = require('@cdo/apps/util/color');
const experiments = require('@cdo/apps/util/experiments');

const MAX_DISPLAY_NOTES = 3;
const FIELD_WIDTH = 51;
const FIELD_HEIGHT = 18;
const FIELD_PADDING = 2;

interface FieldTuneOptions {
  getLibrary: () => MusicLibrary;
  previewTune: MusicPlayer['previewTune'];
  previewNote: MusicPlayer['previewNote'];
  cancelPreviews: MusicPlayer['cancelPreviews'];
  currentValue: TuneEventValue;
  setupSampler: MusicPlayer['setupSampler'];
  isInstrumentLoading: MusicPlayer['isInstrumentLoading'];
  isInstrumentLoaded: MusicPlayer['isInstrumentLoaded'];
  registerInstrumentLoadCallback: (
    callback: (instrumentName: string) => void
  ) => void;
}

/**
 * A custom field that renders the tune selection UI, used in the
 * "play_tune" block. The UI is rendered by {@link TunePanel}.
 */
export default class FieldTune extends Field {
  static fromJson(options: FieldTuneOptions) {
    return new FieldTune(options);
  }

  private options: FieldTuneOptions;
  private newDiv: HTMLDivElement | null;
  private backgroundElement: SVGGraphicsElement | null;

  constructor(options: FieldTuneOptions) {
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

  loadState(state: TuneEventValue) {
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

    const graphNotes: TuneGraphEvent[] = generateGraphDataFromTune({
      tuneEventValue: this.getValue(),
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
      React.createElement<TunePanelProps>(TunePanel, {
        library: this.options.getLibrary(),
        initValue: this.getValue(),
        onChange: this.onValueChange,
        ...this.options,
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

  private onValueChange = (value: TuneEventValue) => this.setValue(value);
}
