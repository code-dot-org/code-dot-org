import { appendCategory, createJsWrapperBlockCreator } from '../block_utils';
import { getStore } from '../redux';

const SPRITE_COLOR = [184, 1.00, 0.74];
const EVENT_COLOR = [140, 1.00, 0.74];
const EVENT_LOOP_COLOR = [322, 0.90, 0.95];
const VARIABLES_COLOR = [312, 0.32, 0.62];
const WORLD_COLOR = [240, 0.45, 0.65];

export default {
  install(blockly, blockInstallOptions) {
    // TODO(ram): Create Blockly.BlockValueType.SPRITE
    const SPRITE_TYPE = blockly.BlockValueType.NONE;
    const { ORDER_MEMBER } = Blockly.JavaScript;

    const sprites = () => {
      const animationList = getStore().getState().animationList;
      if (!animationList || animationList.orderedKeys.length === 0) {
        console.warn("No sprites available");
        return [['sprites missing', 'null']];
      }
      return animationList.orderedKeys.map(key => {
        const name = animationList.propsByKey[key].name;
        return [name, `"${name}"`];
      });
    };

    const createJsWrapperBlock =
      createJsWrapperBlockCreator(blockly, 'gamelab');

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'makeNewSprite',
      blockText: 'make a new {ANIMATION} sprite at {X} {Y}',
      args: [
        { name: 'ANIMATION', options: sprites },
        { name: 'X', type: blockly.BlockValueType.NUMBER },
        { name: 'Y', type: blockly.BlockValueType.NUMBER },
      ],
      returnType: SPRITE_TYPE,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'makeNewGroup',
      blockText: 'make a new group',
      args: [],
      returnType: SPRITE_TYPE,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'add',
      blockText: 'add {SPRITE} to group {THIS}',
      args: [
        { name: 'SPRITE', type: SPRITE_TYPE },
      ],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'moveUp',
      blockText: '{THIS} move up',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'moveDown',
      blockText: '{THIS} move down',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'moveLeft',
      blockText: '{THIS} move left',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'moveRight',
      blockText: '{THIS} move right',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenUpArrow',
      blockText: 'when up arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenDownArrow',
      blockText: 'when down arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenLeftArrow',
      blockText: 'when left arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenRightArrow',
      blockText: 'when right arrow presssed',
      args: [],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_LOOP_COLOR,
      func: 'whileUpArrow',
      blockText: 'while up arrow presssed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_LOOP_COLOR,
      func: 'whileDownArrow',
      blockText: 'while down arrow presssed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_LOOP_COLOR,
      func: 'whileLeftArrow',
      blockText: 'while left arrow presssed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_LOOP_COLOR,
      func: 'whileRightArrow',
      blockText: 'while right arrow presssed',
      args: [],
      eventLoopBlock: true,
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'whenTouching',
      blockText: 'when {SPRITE1} is touching {SPRITE2}',
      args: [
        { name: 'SPRITE1', type: SPRITE_TYPE },
        { name: 'SPRITE2', type: SPRITE_TYPE },
      ],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'displace',
      blockText: '{THIS} blocks {SPRITE} from moving',
      args: [
        {name: 'SPRITE', type: SPRITE_TYPE },
      ],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'destroy',
      blockText: 'remove {THIS}',
      args: [],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: VARIABLES_COLOR,
      expression: 'arguments[0]',
      orderPrecedence: ORDER_MEMBER,
      name: 'firstTouched',
      blockText: 'first touched sprite',
      returnType: SPRITE_TYPE,
    });

    createJsWrapperBlock({
      color: VARIABLES_COLOR,
      expression: 'arguments[1]',
      orderPrecedence: ORDER_MEMBER,
      name: 'secondTouched',
      blockText: 'second touched sprite',
      returnType: SPRITE_TYPE,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      expression: 'length',
      orderPrecedence: ORDER_MEMBER,
      name: 'groupLength',
      blockText: 'number of sprites in {THIS}',
      methodCall: true,
      returnType: blockly.BlockValueType.NUMBER,
    });

    createJsWrapperBlock({
      color: WORLD_COLOR,
      func: 'setBackground',
      blockText: 'set background color {COLOR}',
      args: [
        { name: 'COLOR', type: blockly.BlockValueType.COLOUR },
      ],
    });

    createJsWrapperBlock({
      color: EVENT_COLOR,
      func: 'clickedOn',
      blockText: 'when {SPRITE} clicked on',
      args: [
        { name: 'SPRITE', type: SPRITE_TYPE },
      ],
      eventBlock: true,
    });

    createJsWrapperBlock({
      color: SPRITE_COLOR,
      func: 'setPosition',
      blockText: 'move {THIS} to the {POSITION} position',
      args: [
        {
          name: 'POSITION',
          options: [
            ['top left', '{x: 50, y: 50}'],
            ['top center', '{x: 200, y: 50}'],
            ['top right', '{x: 350, y: 50}'],
            ['center left', '{x: 50, y: 200}'],
            ['center', '{x: 200, y: 200}'],
            ['center right', '{x: 350, y: 200}'],
            ['bottom left', '{x: 50, y: 350}'],
            ['bottom center', '{x: 200, y: 350}'],
            ['bottom right', '{x: 350, y: 350}'],
            ['random', '"random"'],
          ],
        },
      ],
      methodCall: true,
    });

    createJsWrapperBlock({
      color: WORLD_COLOR,
      func: 'showTitleScreen',
      blockText: 'show title screen',
      args: [
        { name: 'TITLE', label: 'title', type: blockly.BlockValueType.STRING },
        { name: 'SUBTITLE', label: 'text', type: blockly.BlockValueType.STRING }
      ],
      inline: false,
    });

    createJsWrapperBlock({
      color: WORLD_COLOR,
      func: 'hideTitleScreen',
      blockText: 'hide title screen',
      args: [],
    });
  },

  installCustomBlocks(blockly, blockInstallOptions, customBlocks, level) {
    const blockNames =
      customBlocks.map(createJsWrapperBlockCreator(blockly, 'gamelab'));

    level.toolbox = appendCategory(level.toolbox, blockNames, 'Custom');
  },
};
