import * as Blockly from 'blockly/core';
import {createRoot} from 'react-dom/client';

import {PluginType} from '@code-dot-org/blockly-workspace/plugins';
import type {FieldPlugin} from '@code-dot-org/blockly-workspace/plugins';
import {experiments} from '@code-dot-org/metrics';

import {DEFAULT_PATTERN_LENGTH} from '../../constants';
import {generateGraphDataFromPattern} from '../../utils/Patterns';
import InstrumentGrid from '../../components/InstrumentGrid';
import type {InstrumentEventValue} from '../../player/interfaces/InstrumentEvent';

const FIELD_WIDTH = 32;
const FIELD_HEIGHT = 18;
const FIELD_PADDING = 2;

const getCSSVariable: (name: string) => string = name =>
  typeof window !== 'undefined'
    ? window.getComputedStyle(document.body).getPropertyValue(`--${name}`) || ''
    : '';

export interface FieldPatternOptions {
  currentValue: InstrumentEventValue;
}

/**
 * A custom field that renders the pattern editing UI, used in the
 * "play_pattern" block.
 */
export class FieldPattern extends Blockly.Field {
  protected options: FieldPatternOptions;
  private newDiv: HTMLDivElement | null;
  private root: ReturnType<typeof createRoot> | null;
  readonly CURSOR: string;
  private backgroundElement: SVGGraphicsElement | null;
  private onValueChange: (value: InstrumentEventValue) => void;

  constructor(options: FieldPatternOptions) {
    super(options.currentValue);

    this.newDiv = null;
    this.root = null;
    this.options = options;
    this.SERIALIZABLE = true;
    this.CURSOR = 'default';
    this.backgroundElement = null;
    this.onValueChange = value => this.setValue(value);
  }

  saveState() {
    return this.getValue();
  }

  loadState(
    state: Omit<InstrumentEventValue, 'length'> &
      Partial<Pick<InstrumentEventValue, 'length'>> & {kit?: string},
  ) {
    if (state.kit) {
      state.instrument = state.kit;
      delete state.kit;
    }

    state.length ||= DEFAULT_PATTERN_LENGTH;
    this.setValue(state);
  }

  static fromJson(_options: Blockly.FieldConfig) {
    const options = _options as FieldPatternOptions;
    return new FieldPattern(options);
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
    if (!this.sourceBlock_) {
      return;
    }

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
    this.newDiv.style.backgroundColor = getCSSVariable('neutral-base-black');
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
      <div data-theme={siteTheme}>
        <InstrumentGrid
          editorType="drums"
          // Make a copy of the value object so that we don't overwrite Blockly's data.
          initialValue={JSON.parse(JSON.stringify(this.getValue()))}
          onChange={this.onValueChange}
          lengthMeasures={1}
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
          fill: getCSSVariable('neutral-gray-5'),
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
  name: 'field_pattern',
  field: FieldPattern,
};

export default plugin;
