import {
  Blockly,
  createReactField,
  getCSSVariable,
} from '@code-dot-org/blockly-workspace';
import type {
  ReactFieldEditorProps,
  ReactFieldPreviewContext,
} from '@code-dot-org/blockly-workspace';

import {DEFAULT_PATTERN_AI, PATTERN_AI_NUM_SEED_EVENTS} from '../../constants';
import {generateGraphDataFromPattern} from '../../utils/Patterns';
import PatternAiPanel from '../../components/PatternAiPanel';
import type {InstrumentEventValue} from '../../player/interfaces/InstrumentEvent';

const FIELD_WIDTH = 64;
const FIELD_HEIGHT = 18;
const FIELD_PADDING = 2;

/**
 * Renders the SVG preview of the AI pattern on the block.
 */
function renderPatternAiPreview({
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
    // Use different color for seed events vs AI-generated events
    const fill =
      graphNote.tick <= PATTERN_AI_NUM_SEED_EVENTS
        ? '#fca401'
        : getCSSVariable('brand-aqua-50');

    Blockly.utils.dom.createSvgElement(
      'rect',
      {
        fill,
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
 * Editor component for the AI pattern field.
 * Wraps PatternAiPanel with proper height.
 */
function PatternAiEditor({
  value,
  onChange,
}: ReactFieldEditorProps<InstrumentEventValue>) {
  return (
    <div style={{height: '100%'}}>
      <PatternAiPanel initValue={value} onChange={onChange} />
    </div>
  );
}

/**
 * Migrates old pattern state format to new format.
 */
function loadPatternAiState(state: unknown): InstrumentEventValue {
  const typedState = state as InstrumentEventValue & {kit?: string};

  // Migrate old 'kit' property to 'instrument'
  if (typedState.kit) {
    typedState.instrument = typedState.kit;
    delete typedState.kit;
  }

  return typedState;
}

/**
 * A custom field that renders the pattern editing UI, used in the
 * "play_pattern_ai" block. The UI is rendered by {@link PatternAiPanel}.
 */
export const plugin = createReactField<InstrumentEventValue>({
  name: 'field_pattern_ai',
  defaultValue: DEFAULT_PATTERN_AI,

  Editor: PatternAiEditor,

  renderPreview: renderPatternAiPreview,
  loadState: loadPatternAiState,

  width: FIELD_WIDTH,
  height: FIELD_HEIGHT,

  dropdownStyle: {
    color: getCSSVariable('neutral-gray-5'),
    width: '900px',
    height: '274px',
    backgroundColor: getCSSVariable('neutral-gray-99'),
  },
});

export default plugin;
