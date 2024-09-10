import GoogleBlockly from 'blockly/core';

import {getToolboxType} from '@cdo/apps/blockly/addons/cdoUtils';
import {ToolboxType} from '@cdo/apps/blockly/constants';
import color from '@cdo/apps/util/color';
import experiments from '@cdo/apps/util/experiments';

import {getStore} from '../../redux';
import {openAiModal} from '../danceRedux';

const ITEM_WIDTH = 24;
const ITEM_SPACING = 1;
const FIELD_HEIGHT = 24;
const FIELD_PADDING = 2;

class CdoFieldDanceAi extends GoogleBlockly.Field {
  constructor(options) {
    super();

    this.options = options;
    this.SERIALIZABLE = true;
    this.CURSOR = 'default';
    this.backgroundElement = null;
  }

  saveState() {
    return this.getValue();
  }

  loadState(state) {
    this.setValue(state);
  }

  static fromJson(options) {
    return new CdoFieldDanceAi(options);
  }

  initView() {
    this.createBorderRect_();
    this.createTextElement_();
    if (this.borderRect_) {
      this.borderRect_.classList.add('blocklyDropdownRect');
    }

    this.backgroundElement = GoogleBlockly.utils.dom.createSvgElement(
      'g',
      {
        transform: 'translate(1,1)',
      },
      this.fieldGroup_
    );

    this.updateSize_();
  }

  applyColour() {
    const style = this.sourceBlock_.style;
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

  showEditor_() {
    // At time of writing, the modal doesn't open if clicked within a categorized toolbox.
    // As a result, this logic only accommodates uncategorized toolboxes.
    // The logic to get the blocks in a categorized toolbox is different than that of an
    // uncategorized one, so additional logic would need to be added here if that changes.
    const isInFlyout =
      getToolboxType() === ToolboxType.UNCATEGORIZED &&
      Blockly.getMainWorkspace()
        .getFlyout(true)
        .getWorkspace()
        .getAllBlocks(false)
        .includes(this.getSourceBlock());

    getStore().dispatch(
      openAiModal({
        blockId: this.sourceBlock_.id,
        fromFlyout: isInFlyout,
      })
    );
  }

  renderContent() {
    if (!this.newDiv_) {
      return;
    }
  }

  dropdownDispose_() {
    this.newDiv_ = null;
  }

  hide_() {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  }

  render_() {
    if (this.backgroundElement) {
      this.backgroundElement.innerHTML = '';
    }

    const inputs = JSON.parse(this.getValue() || '{}')?.inputs;

    // Create the background rectangle and attach it to the background
    // parent.
    GoogleBlockly.utils.dom.createSvgElement(
      'rect',
      {
        fill: color.neutral_dark90,
        x: 1,
        y: 1,
        width: 3 * ITEM_WIDTH + 2 * FIELD_PADDING,
        height: FIELD_HEIGHT + 2,
        rx: 3,
      },
      this.backgroundElement
    );

    inputs?.forEach((input, index) => {
      GoogleBlockly.utils.dom.createSvgElement(
        'image',
        {
          x: FIELD_PADDING + (ITEM_WIDTH + ITEM_SPACING) * index,
          y: FIELD_PADDING,
          width: ITEM_WIDTH,
          href: `/blockly/media/dance/ai/emoji/${input}.svg`,
        },
        this.backgroundElement
      );
    });

    // Now attach the text element to the background parent.  It will
    // render on top of the background rectangle.
    //this.backgroundElement.appendChild(textElement);

    // update size
    this.updateSize_();
  }

  getText() {
    return '';
  }

  updateSize_() {
    const width = 3 * ITEM_WIDTH + 2 * FIELD_PADDING + 2 * ITEM_SPACING + 2;
    const height = FIELD_HEIGHT + 2 * FIELD_PADDING + 2;

    this.borderRect_?.setAttribute('width', '' + width);
    this.borderRect_?.setAttribute('height', '' + height);

    this.size_.width = width;
    this.size_.height = height;
  }
}

export default CdoFieldDanceAi;
