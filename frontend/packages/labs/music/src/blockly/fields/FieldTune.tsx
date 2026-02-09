import {
  Blockly,
  createReactField,
  getCSSVariable,
} from '@code-dot-org/blockly-workspace';
import type {
  ReactFieldEditorProps,
  ReactFieldPreviewContext,
} from '@code-dot-org/blockly-workspace';
import type {BlockSvg} from '@code-dot-org/blockly-workspace';

import {DEFAULT_KEY, DEFAULT_TUNE} from '../../constants';
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

/**
 * Editor component for the tune field.
 * Renders an InstrumentGrid for note selection.
 */
function TuneEditor({
  value,
  onChange,
}: ReactFieldEditorProps<InstrumentEventValue>) {
  return (
    <InstrumentGrid
      initialValue={value}
      editorType="notes"
      onChange={onChange}
      lengthMeasures={1}
    />
  );
}

/**
 * Renders the SVG preview of the tune on the block.
 */
function renderTunePreview({
  value,
  element,
  width,
  height,
  sourceBlock,
}: ReactFieldPreviewContext<InstrumentEventValue>) {
  const {events, scaleMode = 'simple', relative} = value;

  // Embedded workspaces do not use a player, so we use the default key.
  let key = DEFAULT_KEY;
  if (!(sourceBlock as BlockSvg | undefined)?.isWithinEmbeddedWorkspace()) {
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
    value.instrument,
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
    width,
    height,
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
      element,
    );
  });
}

/**
 * Gets the display text for the tune field.
 */
function getTuneText(value: InstrumentEventValue): string {
  const {events, instrument} = value;
  if (events.length === 0) {
    return 'select notes';
  }

  const truncatedNotes = events
    .map(event => getNoteName(event.note))
    .slice(0, MAX_DISPLAY_NOTES)
    .join(', ');

  const displayNotes =
    events.length > MAX_DISPLAY_NOTES ? truncatedNotes + '...' : truncatedNotes;

  return `${instrument} (${displayNotes})`;
}

/**
 * A custom field that renders the tune selection UI, used in the
 * "play_tune" block. The UI is rendered by {@link InstrumentGrid}.
 */
export const plugin = createReactField<InstrumentEventValue>({
  name: 'field_tune',
  defaultValue: DEFAULT_TUNE,

  Editor: TuneEditor,
  renderPreview: renderTunePreview,
  getText: getTuneText,

  width: FIELD_WIDTH,
  height: FIELD_HEIGHT,

  dropdownStyle: {
    color: getCSSVariable('neutral-gray-5'),
    backgroundColor: getCSSVariable('neutral-gray-99'),
  },
});

export default plugin;
