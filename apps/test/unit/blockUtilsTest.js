import dedent from 'dedent';
import {
  appendBlocksByCategory,
  appendNewFunctions,
  cleanBlocks,
  determineInputs,
  interpolateInputs,
  groupInputsByRow,
  createJsWrapperBlockCreator
} from '@cdo/apps/block_utils';
import {parseElement, serialize} from '@cdo/apps/xml.js';
import {expect} from '../util/deprecatedChai';
import sinon from 'sinon';
import {allowConsoleWarnings} from '../util/testUtils';

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
        </xml>`).ownerDocument;

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

      const newToolbox = appendBlocksByCategory(oldToolbox, {
        Custom: ['do_cool_stuff', 'even_cooler_stuff']
      });

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

    it('adds blocks to an existing category', () => {
      const oldToolbox = `
        <xml>
          <category name="Start">
            <block type="when_run"/>
          </category>
        </xml>
      `;

      const newToolbox = appendBlocksByCategory(oldToolbox, {
        Start: ['do_cool_stuff', 'even_cooler_stuff']
      });

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

    it('adds all blocks to an uncategorized toolbox', () => {
      const oldToolbox = `
        <xml>
          <block type="when_run"/>
        </xml>
      `;

      const newToolbox = appendBlocksByCategory(oldToolbox, {
        Custom: ['do_cool_stuff', 'even_cooler_stuff']
      });

      expect(newToolbox).xml.to.equal(`
        <xml>
          <block type="when_run"/>
          <block type="do_cool_stuff" />
          <block type="even_cooler_stuff" />
        </xml>
      `);
    });

    it('adds blocks to multiple existing/new categories', () => {
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

      const newToolbox = appendBlocksByCategory(oldToolbox, {
        Start: ['do_cool_stuff', 'even_cooler_stuff'],
        Sprites: ['gamelab_moveLeft', 'gamelab_moveRight'],
        Events: ['gamelab_whenUpArrow', 'gamelab_whenDownArrow'],
        Custom: ['gamelab_consoleLog']
      });

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

  describe('appendNewFunctions', () => {
    it('appends functions to starter code', () => {
      const startCode = `
        <xml>
          <block type="when_run"/>
        </xml>
      `;

      const functions = `
        <block type="behavior_definition" deletable="false" movable="false" editable="false">
          <mutation>
            <arg name="this sprite" type="Sprite"/>
            <description/>
          </mutation>
          <title name="NAME" id="acting">acting</title>
          <statement name="STACK"/>
        </block>
        <block type="behavior_definition" deletable="false" movable="false" editable="false">
          <mutation>
            <arg name="this sprite" type="Sprite"/>
            <description/>
          </mutation>
          <title name="NAME" id="acting2">acting2</title>
          <statement name="STACK"/>
        </block>
      `;

      const newCode = appendNewFunctions(startCode, functions);

      expect(newCode).to.xml.equal(`
        <xml>
          <block type="when_run"/>
          <block type="behavior_definition" deletable="false" movable="false" editable="false">
            <mutation>
              <arg name="this sprite" type="Sprite"/>
              <description/>
            </mutation>
            <title name="NAME" id="acting">acting</title>
            <statement name="STACK"/>
          </block>
          <block type="behavior_definition" deletable="false" movable="false" editable="false">
            <mutation>
              <arg name="this sprite" type="Sprite"/>
              <description/>
            </mutation>
            <title name="NAME" id="acting2">acting2</title>
            <statement name="STACK"/>
          </block>
        </xml>
      `);
    });
  });

  it('Does not append existing functions to starter code', () => {
    const startCode = `
        <xml>
          <block type="when_run"/>
          <block type="behavior_definition" deletable="false" movable="false" editable="false">
            <mutation>
              <arg name="this sprite" type="Sprite"/>
              <description/>
            </mutation>
            <title name="NAME" id="acting">acting</title>
            <statement name="STACK"/>
          </block>
          <block type="behavior_definition" deletable="false" movable="false" editable="false">
            <mutation>
              <arg name="this sprite" type="Sprite"/>
              <description/>
            </mutation>
            <title name="NAME" id="acting2">acting2</title>
            <statement name="STACK"/>
          </block>
        </xml>
      `;

    const functions = `
        <block type="behavior_definition" deletable="false" movable="false" editable="false">
          <mutation>
            <arg name="this sprite" type="Sprite"/>
            <description/>
          </mutation>
          <title name="NAME" id="acting">acting</title>
          <statement name="STACK"/>
        </block>
        <block type="behavior_definition" deletable="false" movable="false" editable="false">
          <mutation>
            <arg name="this sprite" type="Sprite"/>
            <description/>
          </mutation>
          <title name="NAME" id="acting2">acting2</title>
          <statement name="STACK">
            <block type="variables_set" inline="false">
              <title name="VAR">someVar</title>
              <value name="VALUE">
                <block type="math_number">
                  <title name="NUM">200</title>
                </block>
              </value>
            </block>
          </statement>
        </block>
      `;

    const newCode = appendNewFunctions(startCode, functions);

    expect(newCode).to.xml.equal(startCode);
  });

  it('Appends new functions but not existing functions to starter code', () => {
    const startCode = `
        <xml>
          <block type="when_run"/>
          <block type="behavior_definition" deletable="false" movable="false" editable="false">
            <mutation>
              <arg name="this sprite" type="Sprite"/>
              <description/>
            </mutation>
            <title name="NAME" id="acting2">acting2</title>
            <statement name="STACK"/>
          </block>
        </xml>
      `;

    const functions = `
        <block type="behavior_definition" deletable="false" movable="false" editable="false">
          <mutation>
            <arg name="this sprite" type="Sprite"/>
            <description/>
          </mutation>
          <title name="NAME" id="acting">acting</title>
          <statement name="STACK"/>
        </block>
        <block type="behavior_definition" deletable="false" movable="false" editable="false">
          <mutation>
            <arg name="this sprite" type="Sprite"/>
            <description/>
          </mutation>
          <title name="NAME" id="acting2">acting2</title>
          <statement name="STACK">
            <block type="variables_set" inline="false">
              <title name="VAR">someVar</title>
              <value name="VALUE">
                <block type="math_number">
                  <title name="NUM">200</title>
                </block>
              </value>
            </block>
          </statement>
        </block>
      `;

    const newCode = appendNewFunctions(startCode, functions);

    expect(newCode).to.xml.equal(`
        <xml>
          <block type="when_run"/>
          <block type="behavior_definition" deletable="false" movable="false" editable="false">
            <mutation>
              <arg name="this sprite" type="Sprite"/>
              <description/>
            </mutation>
            <title name="NAME" id="acting2">acting2</title>
            <statement name="STACK"/>
          </block>
          <block type="behavior_definition" deletable="false" movable="false" editable="false">
            <mutation>
              <arg name="this sprite" type="Sprite"/>
              <description/>
            </mutation>
            <title name="NAME" id="acting">acting</title>
            <statement name="STACK"/>
          </block>
        </xml>
      `);
  });

  const TEST_SPRITES = [['dog', '"dog"'], ['cat', '"cat"']];

  describe('interpolateInputs', () => {
    let fakeBlockly, fakeBlock, fakeInput;
    let appendDummyInput, appendTitle, setCheck, appendValueInput, setAlign;
    beforeEach(() => {
      appendDummyInput = sinon.stub();
      appendValueInput = sinon.stub();
      fakeBlock = {appendDummyInput, appendValueInput};

      appendTitle = sinon.stub();
      setCheck = sinon.stub();
      setAlign = sinon.stub();
      fakeInput = {setCheck, appendTitle, setAlign};

      appendDummyInput.returns(fakeInput);
      appendValueInput.returns(fakeInput);
      appendTitle.returns(fakeInput);
      setCheck.returns(fakeInput);
      setAlign.returns(fakeInput);

      fakeBlockly = {
        FieldDropdown: sinon.stub()
      };
    });

    it('adds a dropdown input', () => {
      interpolateInputs(
        fakeBlockly,
        fakeBlock,
        groupInputsByRow([
          {
            mode: 'dropdown',
            name: 'ANIMATION',
            label: 'create sprite ',
            options: TEST_SPRITES
          }
        ])
      );

      expect(fakeBlockly.FieldDropdown).to.have.been.calledOnce;
      const dropdownArg = fakeBlockly.FieldDropdown.firstCall.args[0];
      expect(dropdownArg).to.deep.equal(TEST_SPRITES);
      expect(appendDummyInput).to.have.been.calledOnce;
      expect(appendTitle).to.have.been.calledWith(sinon.match.any, 'ANIMATION');
    });

    it('adds a value input', () => {
      interpolateInputs(
        fakeBlockly,
        fakeBlock,
        groupInputsByRow([
          {
            mode: 'value',
            name: 'DISTANCE',
            type: Blockly.BlockValueType.NUMBER,
            label: 'block title'
          }
        ])
      );

      expect(appendValueInput).to.have.been.calledWith('DISTANCE');
      expect(setCheck).to.have.been.calledWith(Blockly.BlockValueType.NUMBER);
      expect(appendTitle).to.have.been.calledWith('block title');
    });

    it('adds a dummy input', () => {
      interpolateInputs(
        fakeBlockly,
        fakeBlock,
        groupInputsByRow([
          {
            mode: 'dummy',
            label: 'block title'
          }
        ])
      );

      expect(appendDummyInput).to.have.been.calledOnce;
      expect(appendTitle).to.have.been.calledWith('block title');
    });

    it('adds all three', () => {
      interpolateInputs(
        fakeBlockly,
        fakeBlock,
        groupInputsByRow([
          {
            mode: 'dropdown',
            name: 'ANIMATION',
            label: 'dropdown ',
            options: TEST_SPRITES
          },
          {
            mode: 'value',
            name: 'DISTANCE',
            type: Blockly.BlockValueType.NUMBER,
            label: 'value label'
          },
          {
            mode: 'dummy',
            label: 'dummy label'
          }
        ])
      );

      expect(appendTitle).to.have.been.calledWith(sinon.match.any, 'ANIMATION');
      expect(appendTitle).to.have.been.calledWith('value label');
      expect(appendTitle).to.have.been.calledWith('dummy label');
    });

    it('adds labels before and after value input', () => {
      interpolateInputs(
        fakeBlockly,
        fakeBlock,
        groupInputsByRow([
          {
            mode: 'value',
            name: 'VALUE',
            label: 'prefix'
          },
          {
            mode: 'dummy',
            label: 'suffix'
          }
        ])
      );

      expect(appendValueInput).to.have.been.calledWith('VALUE');
      expect(appendTitle).to.have.been.calledWith('prefix');
      expect(appendDummyInput).to.have.been.calledOnce;
      expect(appendTitle).to.have.been.calledWith('suffix');
    });

    describe('groupInputsByRow', () => {
      const valueInput1 = {
        mode: 'value',
        name: 'VALUE1',
        label: 'hello'
      };
      const valueInput2 = {
        mode: 'value',
        name: 'VALUE2',
        label: 'world'
      };
      const fieldInput = {
        mode: 'dropdown',
        name: 'DROPDOWN',
        label: 'foo'
      };
      const dummyInput = {
        mode: 'dummy'
      };
      it('groups a single value input as one row', () => {
        const groupedInputs = groupInputsByRow([valueInput1]);
        expect(groupedInputs).to.deep.equal([[valueInput1]]);
      });
      it('groups two value inputs as two rows', () => {
        const groupedInputs = groupInputsByRow([valueInput1, valueInput2]);
        expect(groupedInputs).to.deep.equal([[valueInput1], [valueInput2]]);
      });
      it('groups a field and value input as one row', () => {
        const groupedInputs = groupInputsByRow([fieldInput, valueInput1]);
        expect(groupedInputs).to.deep.equal([[fieldInput, valueInput1]]);
      });
      it('groups a value and field input as two rows with a dummy input on the second', () => {
        const groupedInputs = groupInputsByRow([valueInput1, fieldInput]);
        expect(groupedInputs).to.deep.equal([
          [valueInput1],
          [fieldInput, dummyInput]
        ]);
      });
      it('groups a field and two value inputs as two rows', () => {
        const groupedInputs = groupInputsByRow([
          fieldInput,
          valueInput1,
          valueInput2
        ]);
        expect(groupedInputs).to.deep.equal([
          [fieldInput, valueInput1],
          [valueInput2]
        ]);
      });
    });
  });

  describe('determineInputs', () => {
    const NUMBER = 5;

    it('creates a single dummy input for no inputs', () => {
      const inputs = determineInputs('block text', []);
      expect(inputs).to.deep.equal([
        {
          mode: 'dummy',
          label: 'block text'
        }
      ]);
    });

    it('creates a dropdown input', () => {
      const inputs = determineInputs('create a {ANIMATION} sprite', [
        {
          name: 'ANIMATION',
          options: TEST_SPRITES
        }
      ]);
      expect(inputs).to.deep.equal([
        {
          mode: 'dropdown',
          name: 'ANIMATION',
          label: 'create a ',
          options: TEST_SPRITES,
          strict: false
        },
        {
          mode: 'dummy',
          label: ' sprite'
        }
      ]);
    });

    it('creates a value input', () => {
      const inputs = determineInputs('move {DISTANCE} pixels', [
        {
          name: 'DISTANCE',
          type: NUMBER
        }
      ]);
      expect(inputs).to.deep.equal([
        {
          mode: 'value',
          name: 'DISTANCE',
          type: NUMBER,
          label: 'move ',
          strict: false
        },
        {
          mode: 'dummy',
          label: ' pixels'
        }
      ]);
    });

    it('creates both inputs', () => {
      const inputs = determineInputs('create a {ANIMATION} sprite at {X} {Y}', [
        {name: 'ANIMATION', options: TEST_SPRITES},
        {name: 'X', type: NUMBER},
        {name: 'Y', type: NUMBER}
      ]);
      expect(inputs).to.deep.equal([
        {
          mode: 'dropdown',
          name: 'ANIMATION',
          options: TEST_SPRITES,
          label: 'create a ',
          strict: false
        },
        {
          mode: 'value',
          name: 'X',
          type: NUMBER,
          label: ' sprite at ',
          strict: false
        },
        {mode: 'value', name: 'Y', type: NUMBER, label: ' ', strict: false}
      ]);
    });

    it('removes trailing empty strings', () => {
      const inputs = determineInputs('set speed to {SPEED}', [
        {name: 'SPEED', type: NUMBER}
      ]);
      expect(inputs).to.deep.equal([
        {
          mode: 'value',
          name: 'SPEED',
          type: NUMBER,
          label: 'set speed to ',
          strict: false
        }
      ]);
    });

    it('adds a dummy input for newlines', () => {
      const inputs = determineInputs('this block has \n two lines', []);
      expect(inputs).to.deep.equal([
        {
          mode: 'dummy',
          label: 'this block has '
        },
        {
          mode: 'dummy',
          label: ' two lines'
        }
      ]);
    });

    it('adds a dummy input for multiple newlines', () => {
      const inputs = determineInputs(
        'this block has \n three lines {WITH}\n a field input',
        [
          {
            name: 'WITH',
            field: true
          }
        ]
      );
      expect(inputs).to.deep.equal([
        {
          mode: 'dummy',
          label: 'this block has '
        },
        {
          name: 'WITH',
          mode: 'field',
          label: ' three lines ',
          strict: false
        },
        {
          mode: 'dummy',
          label: ''
        },
        {
          mode: 'dummy',
          label: ' a field input'
        }
      ]);
    });
  });

  describe('custom generators', () => {
    let createBlock, generator;
    before(() => {
      createBlock = createJsWrapperBlockCreator(
        Blockly,
        [],
        Blockly.BlockValueType.SPRITE,
        []
      );
      generator = Blockly.Generator.get('JavaScript');
    });
    describe('assignment', () => {
      it('generates code for a single assignment', () => {
        createBlock(
          {
            func: 'foo',
            blockText: 'set {NAME} to foo()',
            args: [
              {
                name: 'NAME',
                assignment: true,
                field: true
              }
            ]
          },
          '',
          'test'
        );
        const fakeBlock = {
          getTitleValue: sinon.stub().returns('someVar')
        };
        const code = generator['test_foo'].bind(fakeBlock)();
        expect(code).to.equal('someVar = foo(someVar);\n');
      });
      it('generates code for a double assignment', () => {
        createBlock(
          {
            func: 'foo',
            blockText: 'set {NAME1} and {NAME2} to foo()',
            args: [
              {
                name: 'NAME1',
                assignment: true,
                field: true
              },
              {
                name: 'NAME2',
                assignment: true,
                field: true
              }
            ]
          },
          '',
          'test'
        );
        const fakeBlock = {
          getTitleValue: title =>
            ({
              NAME1: 'a',
              NAME2: 'b'
            }[title])
        };
        const code = generator['test_foo'].bind(fakeBlock)();
        expect(code).to.equal('a = b = foo(a, b);\n');
      });
    });
    describe('deferred input', () => {
      it('generates code for a deferred input', () => {
        createBlock(
          {
            func: 'yellAt',
            blockText: '{NAME1} yells at {NAME2}',
            args: [
              {
                name: 'NAME1',
                defer: true
              },
              {
                name: 'NAME2',
                defer: true
              }
            ]
          },
          '',
          'test'
        );

        const valueToCodeStub = sinon
          .stub(Blockly.JavaScript, 'valueToCode')
          .callsFake((block, name) => {
            return {
              NAME1: 'elrond',
              NAME2: 'isildur'
            }[name];
          });
        const code = generator['test_yellAt']();

        expect(code.trim()).to.equal(dedent`
          yellAt(function () {
            return elrond;
          }, function () {
            return isildur;
          });
        `);

        valueToCodeStub.restore();
      });
    });
    describe('simpleValue', () => {
      it('generates code for a simple value with return value', () => {
        createBlock(
          {
            simpleValue: true,
            name: 'simpleValue',
            blockText: '{VAL}',
            args: [{name: 'VAL'}],
            returnType: 'String'
          },
          '',
          'test'
        );
        const valueToCodeStub = sinon
          .stub(Blockly.JavaScript, 'valueToCode')
          .returns('"a string value"');

        expect(generator['test_simpleValue']()[0]).to.equal('"a string value"');

        valueToCodeStub.restore();
      });
      it('generates code for a simple value assignment', () => {
        createBlock(
          {
            simpleValue: true,
            name: 'simpleAssignment',
            blockText: '{VAR} = {VAL}',
            args: [{name: 'VAL'}, {name: 'VAR', assignment: true}]
          },
          '',
          'test'
        );
        const valueToCodeStub = sinon
          .stub(Blockly.JavaScript, 'valueToCode')
          .callsFake((block, name) => {
            return {
              VAR: 'myVariable',
              VAL: '"some other value"'
            }[name];
          });
        const code = generator['test_simpleAssignment']();

        expect(code.trim()).to.equal('myVariable = "some other value";');

        valueToCodeStub.restore();
      });
      it('generates code for a simple value double assignment', () => {
        createBlock(
          {
            simpleValue: true,
            name: 'simpleAssignment',
            blockText: '{VAR1} = {VAR2} = {VAL}',
            args: [
              {name: 'VAL'},
              {name: 'VAR1', assignment: true},
              {name: 'VAR2', assignment: true}
            ]
          },
          '',
          'test'
        );
        const valueToCodeStub = sinon
          .stub(Blockly.JavaScript, 'valueToCode')
          .callsFake((block, name) => {
            return {
              VAR1: 'i',
              VAR2: 'j',
              VAL: '"yet another value"'
            }[name];
          });
        const code = generator['test_simpleAssignment']();

        expect(code.trim()).to.equal('i = j = "yet another value";');

        valueToCodeStub.restore();
      });
      it('throws for a simpleValue block with too many args', () => {
        expect(() => {
          createBlock(
            {
              simpleValue: true,
              name: 'simpleValue',
              blockText: '{VAL1} {VAL2}',
              args: [{name: 'VAL1'}, {name: 'VAL2'}],
              returnType: 'String'
            },
            '',
            'test'
          );
        }).to.throw(Error);
      });
      it('throws for a simple assignment block with too many args', () => {
        expect(() => {
          createBlock(
            {
              simpleValue: true,
              name: 'simpleValue',
              blockText: '{VAR} = {VAL1} {VAL2}',
              args: [
                {name: 'VAR', assignment: true},
                {name: 'VAL1'},
                {name: 'VAL2'}
              ],
              returnType: 'String'
            },
            '',
            'test'
          );
        }).to.throw(Error);
      });
    });
    describe('methodCall', () => {
      it('generates code for a method call', () => {
        createBlock(
          {
            func: 'bark',
            methodCall: true,
            blockText: '{THIS} barks',
            args: []
          },
          '',
          'test'
        );
        const valueToCodeStub = sinon
          .stub(Blockly.JavaScript, 'valueToCode')
          .callsFake((block, name) => {
            return {
              THIS: 'myDog'
            }[name];
          });
        const code = generator['test_bark']();

        expect(code.trim()).to.equal('myDog.bark();');

        valueToCodeStub.restore();
      });
      it('generates code for a method call with specific this object', () => {
        createBlock(
          {
            func: 'sayHi',
            methodCall: true,
            thisObject: 'spot',
            blockText: 'say hi',
            args: []
          },
          '',
          'test'
        );
        const code = generator['test_sayHi']();

        expect(code.trim()).to.equal('spot.sayHi();');
      });
      it('generates code for a object property', () => {
        createBlock(
          {
            name: 'getToy',
            expression: 'favoriteToy',
            methodCall: true,
            blockText: "{THIS}'s favorite toy",
            args: [],
            returnType: 'String'
          },
          '',
          'test'
        );
        const valueToCodeStub = sinon
          .stub(Blockly.JavaScript, 'valueToCode')
          .callsFake((block, name) => {
            return {
              THIS: 'myDog'
            }[name];
          });
        const [code] = generator['test_getToy']();

        expect(code.trim()).to.equal('myDog.favoriteToy');

        valueToCodeStub.restore();
      });
    });
    describe('eventBlock', () => {
      it('generates code for an event block', () => {
        createBlock(
          {
            func: 'whenJump',
            blockText: 'when jump',
            args: [],
            eventBlock: true
          },
          '',
          'test'
        );
        const blockToCodeStub = sinon
          .stub(Blockly.JavaScript, 'blockToCode')
          .callsFake(() => {
            return 'someHandlerCode();\n';
          });
        const code = generator['test_whenJump']();

        expect(code.trim()).to.equal(dedent`
          whenJump(function () {
            someHandlerCode();
          });`);

        blockToCodeStub.restore();
      });
    });
    describe('expression blocks', () => {
      it('generates code for an expression block', () => {
        createBlock(
          {
            name: 'useStrict',
            expression: 'use strict;',
            blockText: 'run this program in strict mode',
            args: []
          },
          '',
          'test'
        );
        const code = generator['test_useStrict']();

        expect(code.trim()).to.equal('use strict;');
      });
      it('generates code for an expression block with a return value', () => {
        createBlock(
          {
            name: 'window',
            expression: 'window',
            blockText: 'window object',
            args: [],
            returnType: 'Object'
          },
          '',
          'test'
        );
        const [code] = generator['test_window']();

        expect(code.trim()).to.equal('window');
      });
    });
    describe('custom inputs', () => {
      allowConsoleWarnings();
      it('generates code for a statement input', () => {
        createBlock(
          {
            func: 'runThisCallback',
            blockText: 'run this callback {STATEMENT}',
            args: [{name: 'STATEMENT', statement: true}]
          },
          '',
          'test'
        );
        const stub = sinon
          .stub(Blockly.JavaScript, 'statementToCode')
          .callsFake(() => `  console.log("I'm in a callback!");\n`);
        const code = generator['test_runThisCallback']();

        expect(code.trim()).to.equal(dedent`
            runThisCallback(function () {
              console.log("I'm in a callback!");
            });
          `);
        stub.restore();
      });
      it('generates no code for an empty input', () => {
        createBlock(
          {
            func: 'skyscraper',
            blockText: "woo {EMTPY} it's a skyscraper",
            args: [{name: 'EMTPY', customInput: 'dummy'}]
          },
          '',
          'test'
        );
        const code = generator['test_skyscraper']();

        expect(code.trim()).to.equal('skyscraper();');
      });
      it('generates code for a dropdown input', () => {
        createBlock(
          {
            func: 'selectOne',
            blockText: 'select one of {DROPDOWN}',
            args: [
              {
                name: 'DROPDOWN',
                options: [['someOption', 7]]
              }
            ]
          },
          '',
          'test'
        );
        const fakeBlock = {
          getTitleValue: () => 7
        };
        const code = generator['test_selectOne'].bind(fakeBlock)();

        expect(code.trim()).to.equal('selectOne(7);');
      });
      it('generates code for a field input', () => {
        createBlock(
          {
            func: 'processValue',
            blockText: 'do something with {INPUT}',
            args: [
              {
                name: 'INPUT',
                field: true
              }
            ]
          },
          '',
          'test'
        );
        const fakeBlock = {
          getTitleValue: () => 42
        };
        const code = generator['test_processValue'].bind(fakeBlock)();

        expect(code.trim()).to.equal('processValue(42);');
      });
      it('wraps field input value in quotes if it is a string type', () => {
        createBlock(
          {
            func: 'processStringValue',
            blockText: 'do something with string {INPUT}',
            args: [
              {
                name: 'INPUT',
                field: true,
                type: 'String'
              }
            ]
          },
          '',
          'test'
        );
        const fakeBlock = {
          getTitleValue: () => 'some input'
        };
        const code = generator['test_processStringValue'].bind(fakeBlock)();

        expect(code.trim()).to.equal('processStringValue("some input");');
      });
      it('escapes quotes in string field inputs', () => {
        createBlock(
          {
            func: 'processAnotherStringValue',
            blockText: 'do something with another string {INPUT}',
            args: [
              {
                name: 'INPUT',
                field: true,
                type: 'String'
              }
            ]
          },
          '',
          'test'
        );
        const fakeBlock = {
          getTitleValue: () => 'some input with a "quote" in it'
        };
        const code = generator['test_processAnotherStringValue'].bind(
          fakeBlock
        )();

        expect(code.trim()).to.equal(
          'processAnotherStringValue("some input with a \\"quote\\" in it");'
        );
      });
      it('does not throw when there are extra args', () => {
        createBlock(
          {
            name: 'extraArgsTest',
            expression: 'extraArgsTest;',
            blockText: 'run this program in strict mode',
            args: [{name: 'EXTRA'}]
          },
          '',
          'test'
        );
        const code = generator['test_extraArgsTest']();

        expect(code.trim()).to.equal('extraArgsTest;');
      });
    });
  });
});
