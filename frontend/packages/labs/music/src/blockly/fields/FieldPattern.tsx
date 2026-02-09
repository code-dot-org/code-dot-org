import {
  Blockly,
  createReactField,
  getCSSVariable,
} from '@code-dot-org/blockly-workspace';
import type {ReactFieldPreviewContext} from '@code-dot-org/blockly-workspace';

import {DEFAULT_PATTERN, DEFAULT_PATTERN_LENGTH} from '../../constants';
import {generateGraphDataFromPattern} from '../../utils/Patterns';
import InstrumentGrid from '../../components/InstrumentGrid';
import type {InstrumentEventValue} from '../../player/interfaces/InstrumentEvent';

const FIELD_WIDTH = 32;
const FIELD_HEIGHT = 18;
const FIELD_PADDING = 2;

/**
 * Renders the SVG preview of the pattern on the block.
 */
function renderPatternPreview({
  value,
  element,
  width,
  height,
}: ReactFieldPreviewContext<InstrumentEventValue>) {
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

  const graphNotes = generateGraphDataFromPattern({
    value,
    width,
    height,
    padding: FIELD_PADDING,
  });

  graphNotes.forEach(graphNote => {
    Blockly.utils.dom.createSvgElement(
      'rect',
      {
        fill: getCSSVariable('neutral-gray-5'),
        x: graphNote.x,
        y: graphNote.y,
        width: graphNote.width,
        height: graphNote.height,
        rx: 2,
      },
      element,
    );
  });
}

/**
 * Migrates old pattern state format to new format.
 */
function loadPatternState(state: unknown): InstrumentEventValue {
  const typedState = state as Omit<InstrumentEventValue, 'length'> &
    Partial<Pick<InstrumentEventValue, 'length'>> & {kit?: string};

  // Migrate old 'kit' property to 'instrument'
  if (typedState.kit) {
    typedState.instrument = typedState.kit;
    delete typedState.kit;
  }

  // Ensure length has a default value
  typedState.length ||= DEFAULT_PATTERN_LENGTH;

  return typedState as InstrumentEventValue;
}

/**
 * A custom field that renders the pattern editing UI, used in the
 * "play_pattern" block.
 */
export const plugin = createReactField<InstrumentEventValue>({
  name: 'field_pattern',
  defaultValue: DEFAULT_PATTERN,

  Editor: ({value, onChange}) => (
    <InstrumentGrid
      editorType="drums"
      initialValue={value}
      onChange={onChange}
      lengthMeasures={1}
    />
  ),

  renderPreview: renderPatternPreview,
  loadState: loadPatternState,

  width: FIELD_WIDTH,
  height: FIELD_HEIGHT,

  dropdownStyle: {
    color: getCSSVariable('neutral-gray-5'),
    backgroundColor: getCSSVariable('neutral-base-black'),
  },
});

export default plugin;
