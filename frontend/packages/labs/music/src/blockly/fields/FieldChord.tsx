import {
  Blockly,
  createReactField,
  getCSSVariable,
} from '@code-dot-org/blockly-workspace';
import type {ReactFieldPreviewContext} from '@code-dot-org/blockly-workspace';

import {DEFAULT_CHORD} from '../../constants';
import ChordPanel from '../../components/ChordPanel';
import type {ChordEventValue} from '../../player/interfaces/ChordEvent';
import type {ChordGraphNote} from '../../utils/Chords';
import {generateGraphDataFromChord} from '../../utils/Chords';
import {getNoteName} from '../../utils/Notes';

const MAX_DISPLAY_NOTES = 3;
const FIELD_WIDTH = 51;
const FIELD_HEIGHT = 18;

/**
 * Renders the SVG preview of the chord on the block.
 */
function renderChordPreview({
  value,
  element,
  width,
  height,
}: ReactFieldPreviewContext<ChordEventValue>) {
  // Draw background
  Blockly.utils.dom.createSvgElement(
    'rect',
    {
      fill: getCSSVariable('neutral-base-black'),
      x: 1,
      y: 1,
      width,
      height,
      rx: 3,
    },
    element,
  );

  const graphNotes: ChordGraphNote[] = generateGraphDataFromChord({
    chordEventValue: value,
    width,
    height,
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
      element,
    );
  });
}

/**
 * Gets the display text for the chord field.
 */
function getChordText(value: ChordEventValue): string {
  const {notes, instrument} = value;
  if (notes.length === 0) {
    return 'select notes';
  }

  const truncatedNotes = notes
    .map(note => getNoteName(note))
    .slice(0, MAX_DISPLAY_NOTES)
    .join(', ');

  const displayNotes =
    notes.length > MAX_DISPLAY_NOTES ? truncatedNotes + '...' : truncatedNotes;

  return `${instrument} (${displayNotes})`;
}

/**
 * A custom field that renders the chord selection UI, used in the
 * "play_chord" block. The UI is rendered by {@link ChordPanel}.
 */
export const plugin = createReactField<ChordEventValue>({
  name: 'field_chord',
  defaultValue: DEFAULT_CHORD,

  Editor: ({value, onChange}) => (
    <ChordPanel initValue={value} onChange={onChange} />
  ),

  renderPreview: renderChordPreview,
  getText: getChordText,

  width: FIELD_WIDTH,
  height: FIELD_HEIGHT,

  dropdownStyle: {
    color: getCSSVariable('neutral-gray-5'),
    backgroundColor: getCSSVariable('neutral-base-black'),
  },
});

export default plugin;
