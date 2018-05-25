import {
  appendBlocksByCategory,
  cleanBlocks,
  determineInputs,
  interpolateInputs,
  groupInputsByRow,
  createJsWrapperBlockCreator,
} from '@cdo/apps/block_utils';
import { parseElement, serialize } from '@cdo/apps/xml.js';
import { expect } from '../util/configuredChai';
import sinon from 'sinon';

describe('block utils', () => {
  describe('cleanBlocks', () => {
    let cleanDom;
    beforeEach(() => {
      cleanDom = parseElement(`
        <xml>
          <block type="jump_to_xy">
            <title name="XPOS">64</title>
            <title name="YPOS">42</title>
          </block>
        </xml>`).ownerDocument;
    });

    it('does nothing to blocks without unwanted attributes', () => {
      const before = serialize(cleanDom);

      cleanBlocks(cleanDom);

      expect(serialize(cleanDom)).to.equal(before);
    });

    it('removes uservisible="false" from blocks', () => {
      const blocksDom = parseElement(`
        <xml>
          <block type="jump_to_xy" uservisible="false">
            <title name="XPOS">64</title>
            <title name="YPOS">42</title>
          </block>
        </xml>`
      ).ownerDocument;

      cleanBlocks(blocksDom);

      expect(serialize(blocksDom)).to.equal(serialize(cleanDom));
    });
  });

  describe('appendBlocksByCategory', () => {
    it('adds a custom category', () => {
      const oldToolbox = `
        <xml>
          <category name="Start">
            <block type="when_run"/>
          </category>
        </xml>
      `;

      const newToolbox = appendBlocksByCategory(
        oldToolbox,
        {
          Custom: ['do_cool_stuff', 'even_cooler_stuff'],
        }
      );

      expect(newToolbox).xml.to.equal(`
        <xml>
          <category name="Start">
            <block type="when_run"/>
          </category>
          <category name="Custom">
            <block type="do_cool_stuff" />
            <block type="even_cooler_stuff" />
          </category>
        </xml>
      `);
    });

    it ('adds blocks to an existing category', () => {
      const oldToolbox = `
        <xml>
          <category name="Start">
            <block type="when_run"/>
          </category>
        </xml>
      `;

      const newToolbox = appendBlocksByCategory(
        oldToolbox,
        {
          Start: ['do_cool_stuff', 'even_cooler_stuff'],
        }
      );

      expect(newToolbox).xml.to.equal(`
        <xml>
          <category name="Start">
            <block type="when_run"/>
            <block type="do_cool_stuff" />
            <block type="even_cooler_stuff" />
          </category>
        </xml>
      `);
    });

    it ('adds all blocks to an uncategorized toolbox', () => {
      const oldToolbox = `
        <xml>
          <block type="when_run"/>
        </xml>
      `;

      const newToolbox = appendBlocksByCategory(
        oldToolbox,
        {
          Custom: ['do_cool_stuff', 'even_cooler_stuff'],
        }
      );

      expect(newToolbox).xml.to.equal(`
        <xml>
          <block type="when_run"/>
          <block type="do_cool_stuff" />
          <block type="even_cooler_stuff" />
        </xml>
      `);
    });

    it ('adds blocks to multiple existing/new categories', () => {
      const oldToolbox = `
        <xml>
          <category name="Start">
            <block type="when_run"/>
          </category>
          <category name="Sprites" custom="Sprite">
            <block type="gamelab_moveUp"/>
            <block type="gamelab_moveDown"/>
          </category>
        </xml>
      `;

      const newToolbox = appendBlocksByCategory(
        oldToolbox,
        {
          Start: ['do_cool_stuff', 'even_cooler_stuff'],
          Sprites: ['gamelab_moveLeft', 'gamelab_moveRight'],
          Events: ['gamelab_whenUpArrow', 'gamelab_whenDownArrow'],
          Custom: ['gamelab_consoleLog'],
        }
      );

      expect(newToolbox).xml.to.equal(`
        <xml>
          <category name="Start">
            <block type="when_run"/>
            <block type="do_cool_stuff" />
            <block type="even_cooler_stuff" />
          </category>
          <category name="Sprites" custom="Sprite">
            <block type="gamelab_moveUp"/>
            <block type="gamelab_moveDown"/>
            <block type="gamelab_moveLeft"/>
            <block type="gamelab_moveRight"/>
          </category>
          <category name="Events">
            <block type="gamelab_whenUpArrow"/>
            <block type="gamelab_whenDownArrow"/>
          </category>
          <category name="Custom">
            <block type="gamelab_consoleLog"/>
          </category>
        </xml>
      `);
    });
  });

  const TEST_SPRITES = [
    ['dog', '"dog"'],
    ['cat', '"cat"'],
  ];

  describe('interpolateInputs', () => {
    let fakeBlockly, fakeBlock, fakeInput;
    let appendDummyInput, appendTitle, setCheck, appendValueInput, setAlign;
    beforeEach(() => {
      appendDummyInput = sinon.stub();
      appendValueInput = sinon.stub();
      fakeBlock = { appendDummyInput, appendValueInput };

      appendTitle = sinon.stub();
      setCheck = sinon.stub();
      setAlign = sinon.stub();
      fakeInput = { setCheck, appendTitle , setAlign };

      appendDummyInput.returns(fakeInput);
      appendValueInput.returns(fakeInput);
      appendTitle.returns(fakeInput);
      setCheck.returns(fakeInput);
      setAlign.returns(fakeInput);

      fakeBlockly = {
        FieldDropdown: sinon.stub(),
      };
    });

    it('adds a dropdown input', () => {
      interpolateInputs(fakeBlockly, fakeBlock, groupInputsByRow([{
        mode: 'dropdown',
        name: 'ANIMATION',
        label: 'create sprite ',
        options: TEST_SPRITES,
      }]));

      expect(fakeBlockly.FieldDropdown).to.have.been.calledOnce;
      const dropdownArg = fakeBlockly.FieldDropdown.firstCall.args[0];
      expect(dropdownArg).to.deep.equal(TEST_SPRITES);
      expect(appendDummyInput).to.have.been.calledOnce;
      expect(appendTitle).to.have.been.calledWith(sinon.match.any, 'ANIMATION');
    });

    it('adds a value input', () => {
      interpolateInputs(fakeBlockly, fakeBlock, groupInputsByRow([{
        mode: 'value',
        name: 'DISTANCE',
        type: Blockly.BlockValueType.NUMBER,
        label: 'block title',
      }]));

      expect(appendValueInput).to.have.been.calledWith('DISTANCE');
      expect(setCheck).to.have.been.calledWith(Blockly.BlockValueType.NUMBER);
      expect(appendTitle).to.have.been.calledWith('block title');
    });

    it('adds a dummy input', () => {
      interpolateInputs(fakeBlockly, fakeBlock, groupInputsByRow([{
        mode: 'dummy',
        label: 'block title',
      }]));

      expect(appendDummyInput).to.have.been.calledOnce;
      expect(appendTitle).to.have.been.calledWith('block title');
    });

    it('adds all three', () => {
      interpolateInputs(fakeBlockly, fakeBlock, groupInputsByRow([
        {
          mode: 'dropdown',
          name: 'ANIMATION',
          label: 'dropdown ',
          options: TEST_SPRITES,
        },
        {
          mode: 'value',
          name: 'DISTANCE',
          type: Blockly.BlockValueType.NUMBER,
          label: 'value label',
        },
        {
          mode: 'dummy',
          label: 'dummy label',
        },
      ]));

      expect(appendTitle).to.have.been.calledWith(sinon.match.any, 'ANIMATION');
      expect(appendTitle).to.have.been.calledWith('value label');
      expect(appendTitle).to.have.been.calledWith('dummy label');
    });

    it('adds labels before and after value input', () => {
      interpolateInputs(fakeBlockly, fakeBlock, groupInputsByRow([
        {
          mode: 'value',
          name: 'VALUE',
          label: 'prefix'
        },
        {
          mode: 'dummy',
          label: 'suffix',
        }
      ]));

      expect(appendValueInput).to.have.been.calledWith('VALUE');
      expect(appendTitle).to.have.been.calledWith('prefix');
      expect(appendDummyInput).to.have.been.calledOnce;
      expect(appendTitle).to.have.been.calledWith('suffix');
    });

    describe('groupInputsByRow', () => {
      const valueInput1 = {
        mode: 'value',
        name: 'VALUE1',
        label: 'hello',
      };
      const valueInput2 = {
        mode: 'value',
        name: 'VALUE2',
        label: 'world',
      };
      const fieldInput = {
        mode: 'dropdown',
        name: 'DROPDOWN',
        label: 'foo',
      };
      const dummyInput = {
        mode: 'dummy',
      };
      it('groups a single value input as one row', () => {
        const groupedInputs = groupInputsByRow([valueInput1]);
        expect(groupedInputs).to.deep.equal([
          [valueInput1],
        ]);
      });
      it('groups two value inputs as two rows', () => {
        const groupedInputs = groupInputsByRow([valueInput1, valueInput2]);
        expect(groupedInputs).to.deep.equal([
          [valueInput1],
          [valueInput2],
        ]);
      });
      it('groups a field and value input as one row', () => {
        const groupedInputs = groupInputsByRow([fieldInput, valueInput1]);
        expect(groupedInputs).to.deep.equal([
          [fieldInput, valueInput1],
        ]);
      });
      it('groups a value and field input as two rows with a dummy input on the second', () => {
        const groupedInputs = groupInputsByRow([valueInput1, fieldInput]);
        expect(groupedInputs).to.deep.equal([
          [valueInput1],
          [fieldInput, dummyInput],
        ]);
      });
      it('groups a field and two value inputs as two rows', () => {
        const groupedInputs = groupInputsByRow([fieldInput, valueInput1, valueInput2]);
        expect(groupedInputs).to.deep.equal([
          [fieldInput, valueInput1],
          [valueInput2],
        ]);
      });
    });
  });

  describe('determineInputs', () => {
    const NUMBER = 5;

    it('creates a single dummy input for no inputs', () => {
      const inputs = determineInputs('block text', []);
      expect(inputs).to.deep.equal([{
        mode: 'dummy',
        label: 'block text',
      }]);
    });

    it('creates a dropdown input', () => {
      const inputs = determineInputs('create a {ANIMATION} sprite', [
        {
          name: 'ANIMATION',
          options: TEST_SPRITES,
        },
      ]);
      expect(inputs).to.deep.equal([
        {
          mode: 'dropdown',
          name: 'ANIMATION',
          label: 'create a ',
          options: TEST_SPRITES,
          strict: false,
        },
        {
          mode: 'dummy',
          label: ' sprite',
        },
      ]);
    });

    it('creates a value input', () => {
      const inputs = determineInputs('move {DISTANCE} pixels', [
        {
          name: 'DISTANCE',
          type: NUMBER,
        },
      ]);
      expect(inputs).to.deep.equal([
        {
          mode: 'value',
          name: 'DISTANCE',
          type: NUMBER,
          label: 'move ',
          strict: false,
        },
        {
          mode: 'dummy',
          label: ' pixels',
        },
      ]);
    });

    it('creates both inputs', () => {
      const inputs = determineInputs('create a {ANIMATION} sprite at {X} {Y}', [
        { name: 'ANIMATION', options: TEST_SPRITES },
        { name: 'X', type: NUMBER},
        { name: 'Y', type: NUMBER},
      ]);
      expect(inputs).to.deep.equal([
        {
          mode: 'dropdown',
          name: 'ANIMATION',
          options: TEST_SPRITES,
          label: 'create a ',
          strict: false,
        },
        {
          mode: 'value',
          name: 'X',
          type: NUMBER,
          label: ' sprite at ',
          strict: false,
        },
        { mode: 'value', name: 'Y', type: NUMBER, label: ' ', strict: false },
      ]);
    });

    it('removes trailing empty strings', () => {
      const inputs = determineInputs('set speed to {SPEED}', [
        { name: 'SPEED', type: NUMBER},
      ]);
      expect(inputs).to.deep.equal([
        {
          mode: 'value',
          name: 'SPEED',
          type: NUMBER,
          label: 'set speed to ',
          strict: false,

        },
      ]);
    });

    it('adds a dummy input for newlines', () => {
      const inputs = determineInputs('this block has \n two lines', []);
      expect(inputs).to.deep.equal([
        {
          mode: 'dummy',
          label: 'this block has ',
        },
        {
          mode: 'dummy',
          label: ' two lines',
        },
      ]);
    });

    it('adds a dummy input for multiple newlines', () => {
      const inputs = determineInputs(
        'this block has \n three lines {WITH}\n a field input',
        [
          {
            name: 'WITH',
            field: true,
          }
        ]
      );
      expect(inputs).to.deep.equal([
        {
          mode: 'dummy',
          label: 'this block has ',
        },
        {
          name: 'WITH',
          mode: 'field',
          label: ' three lines ',
          strict: false,
        },
        {
          mode: 'dummy',
          label: '',
        },
        {
          mode: 'dummy',
          label: ' a field input',
        },
      ]);
    });
  });

  describe('custom generators', () => {
    describe('assignment', () => {
      let createBlock, generator;
      before(() => {
        createBlock = createJsWrapperBlockCreator(
          Blockly,
          'test',
          [],
          Blockly.BlockValueType.SPRITE,
          [],
        );
        generator = Blockly.Generator.get('JavaScript');
      });
      it ('generates code for a single assignment', () => {
        createBlock({
          func: 'foo',
          blockText: 'set {NAME} to foo()',
          args: [{
            name: 'NAME',
            assignment: true,
            field: true,
          }],
        });
        const fakeBlock = {
          getTitleValue: sinon.stub().returns('someVar'),
        };
        const code = generator['test_foo'].bind(fakeBlock)();
        expect(code).to.equal('someVar = foo(someVar);\n');
      });
      it ('generates code for a double assignment', () => {
        createBlock({
          func: 'foo',
          blockText: 'set {NAME1} and {NAME2} to foo()',
          args: [
            {
              name: 'NAME1',
              assignment: true,
              field: true,
            },
            {
              name: 'NAME2',
              assignment: true,
              field: true,
            },
          ],
        });
        const fakeBlock = {
          getTitleValue: title => ({
            NAME1: 'a',
            NAME2: 'b',
          }[title]),
        };
        const code = generator['test_foo'].bind(fakeBlock)();
        expect(code).to.equal('a = b = foo(a, b);\n');
      });
    });
  });
});
