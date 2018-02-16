import blockUtils, {
  cleanBlocks,
  determineInputs,
  interpolateInputs,
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

  const TEST_SPRITES = [
    ['dog', '"dog"'],
    ['cat', '"cat"'],
  ];

  describe('interpolateInputs', () => {
    let fakeBlockly, fakeBlock, fakeInput;
    let appendDummyInput, appendTitle, setCheck, appendValueInput;
    beforeEach(() => {
      appendDummyInput = sinon.stub();
      appendValueInput = sinon.stub();
      fakeBlock = { appendDummyInput, appendValueInput };

      appendTitle = sinon.stub();
      setCheck = sinon.stub();
      fakeInput = { setCheck, appendTitle };

      appendDummyInput.returns(fakeInput);
      appendValueInput.returns(fakeInput);
      appendTitle.returns(fakeInput);
      setCheck.returns(fakeInput);

      fakeBlockly = {
        FieldDropdown: sinon.stub(),
      };
    });

    it('adds a dropdown input', () => {
      const stub = sinon.stub(blockUtils, 'determineInputs').returns([{
        mode: 'dropdown',
        name: 'ANIMATION',
        label: 'create sprite ',
        options: TEST_SPRITES,
      }]);
      interpolateInputs(fakeBlockly, fakeBlock);

      expect(fakeBlockly.FieldDropdown).to.have.been.calledOnce;
      const dropdownArg = fakeBlockly.FieldDropdown.firstCall.args[0];
      expect(dropdownArg).to.deep.equal([
        ['create sprite dog', '"dog"'],
        ['create sprite cat', '"cat"'],
      ]);
      expect(appendDummyInput).to.have.been.calledOnce;
      expect(appendTitle).to.have.been.calledWith(sinon.match.any, 'ANIMATION');

      stub.restore();
    });

    it('adds a value input', () => {
      const stub = sinon.stub(blockUtils, 'determineInputs').returns([{
        mode: 'value',
        name: 'DISTANCE',
        type: Blockly.BlockValueType.NUMBER,
        label: 'block title',
      }]);
      interpolateInputs(fakeBlockly, fakeBlock);

      expect(appendValueInput).to.have.been.calledWith('DISTANCE');
      expect(setCheck).to.have.been.calledWith(Blockly.BlockValueType.NUMBER);
      expect(appendTitle).to.have.been.calledWith('block title');

      stub.restore();
    });

    it('adds a dummy input', () => {
      const stub = sinon.stub(blockUtils, 'determineInputs').returns([{
        mode: 'dummy',
        label: 'block title',
      }]);
      interpolateInputs(fakeBlockly, fakeBlock);

      expect(appendDummyInput).to.have.been.calledOnce;
      expect(appendTitle).to.have.been.calledWith('block title');

      stub.restore();
    });

    it('adds all three', () => {
      const stub = sinon.stub(blockUtils, 'determineInputs').returns([
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
      ]);
      interpolateInputs(fakeBlockly, fakeBlock);

      expect(appendTitle).to.have.been.calledWith(sinon.match.any, 'ANIMATION');
      expect(appendTitle).to.have.been.calledWith('value label');
      expect(appendTitle).to.have.been.calledWith('dummy label');

      stub.restore();
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
        },
        { mode: 'value', name: 'X', type: NUMBER, label: ' sprite at ' },
        { mode: 'value', name: 'Y', type: NUMBER, label: ' ' },
      ]);
    });

    it('removes trailing empty strings', () => {
      const inputs = determineInputs('set speed to {SPEED}', [
        { name: 'SPEED', type: NUMBER},
      ]);
      expect(inputs).to.deep.equal([
        { mode: 'value', name: 'SPEED', type: NUMBER, label: 'set speed to ' },
      ]);
    });
  });
});
