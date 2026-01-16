import * as Blockly from 'blockly/core';
import {createRoot} from 'react-dom/client';

import {PluginType} from '@code-dot-org/blockly-workspace/plugins';
import type {FieldPlugin} from '@code-dot-org/blockly-workspace/plugins';
import {experiments} from '@code-dot-org/metrics';

import {PATTERN_AI_NUM_SEED_EVENTS} from '../../constants';
import {generateGraphDataFromPattern} from '../../utils/Patterns';
import PatternAiPanel from '../../components/PatternAiPanel';
import type {InstrumentEventValue} from '../../player/interfaces/InstrumentEvent';

const FIELD_WIDTH = 64;
const FIELD_HEIGHT = 18;
const FIELD_PADDING = 2;

const getCSSVariable: (name: string) => string = name =>
  typeof window !== 'undefined'
    ? window.getComputedStyle(document.body).getPropertyValue(`--${name}`) || ''
    : '';

export interface FieldPatternAiOptions {
  currentValue: InstrumentEventValue;
}

/**
 * A custom field that renders the pattern editing UI, used in the
 * "play_pattern_ai" block. The UI is rendered by {@link PatternAiPanel}.
 */
export class FieldPatternAi extends Blockly.Field {
  protected options: FieldPatternAiOptions;
  private newDiv: HTMLDivElement | null;
  private root: ReturnType<typeof createRoot> | null;
  readonly CURSOR: string;
  private backgroundElement: SVGGraphicsElement | null;

  constructor(options: FieldPatternAiOptions) {
    super(options.currentValue);

    this.newDiv = null;
    this.root = null;
    this.options = options;
    this.SERIALIZABLE = true;
    this.CURSOR = 'default';
    this.backgroundElement = null;
  }

  saveState() {
    return this.getValue();
  }

  loadState(state: InstrumentEventValue & {kit?: string}) {
    if (state.kit) {
      state.instrument = state.kit;
      delete state.kit;
    }

    this.setValue(state);
  }

  static fromJson(_options: Blockly.FieldConfig) {
    const options = _options as FieldPatternAiOptions;
    return new FieldPatternAi(options);
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
    const sourceBlock = this.sourceBlock_ as Blockly.BlockSvg;
    const style = sourceBlock.style;
    if (this.borderRect_) {
      this.borderRect_.setAttribute('stroke', style.colourTertiary);
      this.borderRect_.setAttribute('fill', 'transparent');
    }
    if (this.textElement_) {
      if (experiments.isEnabled('zelos')) {
        this.textElement_.style.fill = getCSSVariable('neutral-gray-5');
      }
    }
  }

  showEditor_() {
    super.showEditor_();

    const editor = this.dropdownCreate_();
    Blockly.DropDownDiv.getContentDiv().appendChild(editor);

    if (!this.sourceBlock_) {
      return;
    }

    const sourceBlock = this.sourceBlock_ as Blockly.BlockSvg;
    Blockly.DropDownDiv.setColour(
      sourceBlock.style.colourPrimary,
      sourceBlock.style.colourTertiary,
    );

    Blockly.DropDownDiv.showPositionedByField(
      this,
      this.dropdownDispose_.bind(this),
    );
  }

  dropdownCreate_() {
    this.newDiv = document.createElement('div');

    this.renderContent();

    this.newDiv.style.color = getCSSVariable('neutral-gray-5');
    this.newDiv.style.width = '900px';
    this.newDiv.style.height = '274px';
    this.newDiv.style.backgroundColor = getCSSVariable('neutral-gray-99');
    this.newDiv.style.padding = '5px';

    return this.newDiv;
  }

  renderContent() {
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
      <div style={{height: '100%'}} data-theme={siteTheme}>
        <PatternAiPanel
          initValue={this.getValue()}
          onChange={value => {
            this.setValue(value);
          }}
        />
      </div>,
    );
  }

  dropdownDispose_() {
    this.root?.unmount();
    this.newDiv = null;
    this.root = null;
  }

  hide_() {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  }

  render_() {
    if (this.backgroundElement) {
      this.backgroundElement.innerHTML = '';
    }

    Blockly.utils.dom.createSvgElement<SVGRectElement>(
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

    const graphNotes = generateGraphDataFromPattern({
      value: this.getValue(),
      width: FIELD_WIDTH,
      height: FIELD_HEIGHT,
      padding: FIELD_PADDING,
    });

    graphNotes.forEach(graphNote => {
      Blockly.utils.dom.createSvgElement<SVGRectElement>(
        'rect',
        {
          fill:
            graphNote.tick <= PATTERN_AI_NUM_SEED_EVENTS
              ? '#fca401'
              : getCSSVariable('brand-aqua-50'),
          x: graphNote.x,
          y: graphNote.y,
          width: graphNote.width,
          height: graphNote.height,
          rx: 2,
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
}

export const plugin: FieldPlugin = {
  type: PluginType.Field,
  name: 'field_pattern_ai',
  field: FieldPatternAi,
};

export default plugin;
