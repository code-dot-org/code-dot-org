import * as Blockly from 'blockly/core';
import {createRoot} from 'react-dom/client';

import type {BlockSvg} from '@code-dot-org/blockly-workspace';
import {PluginType} from '@code-dot-org/blockly-workspace/plugins';
import type {FieldPlugin} from '@code-dot-org/blockly-workspace/plugins';
import {experiments} from '@code-dot-org/metrics';

import {DEFAULT_KEY} from '../../constants';
import MusicRegistry from '../../MusicRegistry';
import type {
  InstrumentEventValue,
  InstrumentTickEvent,
} from '../../player/interfaces/InstrumentEvent';
import {getNoteName, convertRelativeToAbsolutePitch} from '../../utils/Notes';
import type {TuneGraphEvent} from '../../utils/Tunes';
import {
  generateGraphDataFromTune,
  getNoteColorInfo,
  getDisplayNotes,
} from '../../utils/Tunes';
import InstrumentGrid from '../../components/InstrumentGrid';

const MAX_DISPLAY_NOTES = 3;
const FIELD_WIDTH = 51;
const FIELD_HEIGHT = 18;
const FIELD_PADDING = 2;

const getCSSVariable: (name: string) => string = name =>
  typeof window !== 'undefined'
    ? window.getComputedStyle(document.body).getPropertyValue(`--${name}`) || ''
    : '';

interface FieldTuneOptions {
  currentValue: InstrumentEventValue;
}

/**
 * A custom field that renders the tune selection UI, used in the
 * "play_tune" block. The UI is rendered by {@link InstrumentGrid}.
 */
export class FieldTune extends Blockly.Field {
  static fromJson(_options: Blockly.FieldConfig) {
    const options = _options as FieldTuneOptions;
    return new FieldTune(options);
  }

  protected options: FieldTuneOptions;
  private newDiv: HTMLDivElement | null;
  private root: ReturnType<typeof createRoot> | null;
  private backgroundElement: SVGGraphicsElement | null;

  constructor(options: FieldTuneOptions) {
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

  loadState(state: InstrumentEventValue) {
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
        fill: getCSSVariable('neutral-base-black'),
        x: 1,
        y: 1,
        width: FIELD_WIDTH,
        height: FIELD_HEIGHT,
        rx: 3,
      },
      this.backgroundElement,
    );

    const {events, scaleMode, relative} = this.getValue();

    // Embedded workspaces do not use a player, so we use the default key.
    let key = DEFAULT_KEY;
    if (
      !(
        this.getSourceBlock() as BlockSvg | undefined
      )?.isWithinEmbeddedWorkspace()
    ) {
      key = MusicRegistry.player.getKey();
    }

    const mapFn = relative
      ? (event: InstrumentTickEvent) => ({
          ...event,
          note: convertRelativeToAbsolutePitch(key, event.note),
        })
      : (event: InstrumentTickEvent) => event;

    const displayNotes = getDisplayNotes(
      'notes',
      scaleMode,
      this.getValue().instrument,
      key,
    );

    const notes = events
      .map(mapFn)
      .filter(
        (event: InstrumentTickEvent) =>
          displayNotes.findIndex(
            displayNote => displayNote.note === event.note,
          ) !== -1,
      );

    const graphNotes: TuneGraphEvent[] = generateGraphDataFromTune({
      notes,
      width: FIELD_WIDTH,
      height: FIELD_HEIGHT,
      numOctaves: 3,
      startOctave: 4,
      padding: 2,
      noteHeightScale: 4,
    });

    graphNotes.forEach(graphNote => {
      const {selectedColor} = getNoteColorInfo(
        scaleMode,
        displayNotes.findIndex(
          displayNote => displayNote.note === graphNote.note,
        ),
      );

      Blockly.utils.dom.createSvgElement(
        'rect',
        {
          fill: selectedColor,
          x: graphNote.x,
          y: graphNote.y,
          width: graphNote.width,
          height: graphNote.height,
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

    if (this.root) {
      return;
    }

    // Determine the current site theme
    const workspace = this.sourceBlock_?.workspace as
      | Blockly.WorkspaceSvg
      | undefined;

    const siteTheme =
      workspace
        ?.getInjectionDiv()
        ?.closest('[data-theme]')
        ?.getAttribute('data-theme') || 'Dark';

    this.root = createRoot(this.newDiv);
    this.root.render(
      <div data-theme={siteTheme}>
        <InstrumentGrid
          // Make a copy of the value object so that we don't overwrite Blockly's data.
          initialValue={JSON.parse(JSON.stringify(this.getValue()))}
          editorType={'notes'}
          onChange={this.onValueChange}
          lengthMeasures={1}
        />
      </div>,
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

  private onValueChange = (value: InstrumentEventValue) => this.setValue(value);
}

export const plugin: FieldPlugin = {
  type: PluginType.Field,
  name: 'field_tune',
  field: FieldTune,
};

export default plugin;
