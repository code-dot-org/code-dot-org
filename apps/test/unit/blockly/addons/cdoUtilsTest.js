import sinon from 'sinon';
import {
  getCode,
  moveHiddenProcedures,
  partitionBlocksByType,
} from '@cdo/apps/blockly/addons/cdoUtils';
import * as cdoSerializationHelpers from '@cdo/apps/blockly/addons/cdoSerializationHelpers';
import {PROCEDURE_DEFINITION_TYPES} from '@cdo/apps/blockly/constants';
import {expect} from '../../../util/reconfiguredChai';

const parser = new DOMParser();
const createBlockElement = data =>
  parser.parseFromString(data, 'text/xml').querySelector('block');

describe('CdoUtils', () => {
  describe('partitionBlocksByType', () => {
    it('should work with JSON blocks and prioritized types', () => {
      const blocks = [
        {type: 'blockType1'},
        {type: 'when_run'},
        {type: 'blockType2'},
        {type: 'Dancelab_whenSetup'},
      ];

      const result = partitionBlocksByType(
        blocks,
        ['when_run', 'Dancelab_whenSetup'],
        false
      );
      expect(result).to.deep.equal([
        {type: 'when_run'},
        {type: 'Dancelab_whenSetup'},
        {type: 'blockType1'},
        {type: 'blockType2'},
      ]);
    });

    it('should work with block elements and prioritized types', () => {
      const block1 = createBlockElement('<block type="blockType1"></block>');
      const block2 = createBlockElement(
        '<block type="procedures_defnoreturn"></block>'
      );
      const block3 = createBlockElement('<block type="blockType2"></block>');
      const blockElements = [block1, block2, block3];

      const result = partitionBlocksByType(
        blockElements,
        PROCEDURE_DEFINITION_TYPES,
        true
      );
      expect(result).to.deep.equal([block2, block1, block3]);
    });

    it('should handle an empty block array', () => {
      const result = partitionBlocksByType(
        [],
        PROCEDURE_DEFINITION_TYPES,
        true
      );
      expect(result).to.deep.equal([]);
    });

    it('should return the original array if no prioritized types are provided', () => {
      const blocks = [{type: 'A'}, {type: 'B'}, {type: 'C'}];

      const result = partitionBlocksByType(blocks, undefined, false);
      expect(result).to.deep.equal(blocks);
    });

    it('should not thrown an error and default to using blockElements if isBlockElement is not provided', () => {
      const block1 = createBlockElement('<block type="C"></block>');
      const block2 = createBlockElement('<block type="B"></block>');
      const block3 = createBlockElement('<block type="A"></block>');
      const blockElements = [block1, block2, block3];

      const result = partitionBlocksByType(blockElements, ['A']);
      expect(result).to.deep.equal([block3, block1, block2]);
    });

    it('should handle undefined options', () => {
      const block1 = createBlockElement('<block type="C"></block>');
      const block2 = createBlockElement('<block type="B"></block>');
      const block3 = createBlockElement('<block type="A"></block>');

      const blockElements = [block1, block2, block3];

      const result = partitionBlocksByType(blockElements);
      expect(result).to.deep.equal(blockElements);
    });
  });
  describe('moveHiddenProcedures', () => {
    it('should not move any blocks if none have the appropriate procedure type', () => {
      const source = {
        blocks: {
          blocks: [{type: 'when_run', id: 1}],
        },
        procedures: [],
      };

      const typesToHide = ['procedures_defnoreturn'];
      const result = moveHiddenProcedures(source, typesToHide);
      expect(result).to.deep.equal({
        mainSource: {
          blocks: {
            blocks: [{type: 'when_run', id: 1}],
          },
          procedures: [],
        },
        hiddenDefinitionSource: {blocks: {blocks: []}, procedures: []},
      });
    });

    it('should move all blocks if they all match', () => {
      const source = {
        blocks: {
          blocks: [
            {
              type: 'procedures_defnoreturn',
              id: 1,
              extraState: {procedureId: 'a'},
            },
          ],
        },
        procedures: [{id: 'a'}],
      };

      const typesToHide = ['procedures_defnoreturn'];
      const result = moveHiddenProcedures(source, typesToHide);
      expect(result).to.deep.equal({
        mainSource: {blocks: {blocks: []}, procedures: [{id: 'a'}]},
        hiddenDefinitionSource: {
          blocks: {
            blocks: [
              {
                type: 'procedures_defnoreturn',
                id: 1,
                extraState: {procedureId: 'a'},
              },
            ],
          },
          procedures: [{id: 'a'}],
        },
      });
    });

    it('should handle a mix of blocks to move and blocks not to move', () => {
      const source = {
        blocks: {
          blocks: [
            {type: 'when_run', id: 1},
            {
              type: 'procedures_defnoreturn',
              id: 2,
              extraState: {procedureId: 'a'},
            },
          ],
        },
        procedures: [{id: 'a'}],
      };

      const typesToHide = ['procedures_defnoreturn'];
      const result = moveHiddenProcedures(source, typesToHide);
      expect(result).to.deep.equal({
        mainSource: {
          blocks: {blocks: [{type: 'when_run', id: 1}]},
          procedures: [{id: 'a'}],
        },
        hiddenDefinitionSource: {
          blocks: {
            blocks: [
              {
                type: 'procedures_defnoreturn',
                id: 2,
                extraState: {procedureId: 'a'},
              },
            ],
          },
          procedures: [{id: 'a'}],
        },
      });
    });

    it('should move the block but not the procedure model if a model with the procedure id does not exist', () => {
      const source = {
        blocks: {
          blocks: [
            {
              type: 'procedures_defnoreturn',
              id: 1,
              extraState: {procedureId: 'nonexistent'},
            },
          ],
        },
        procedures: [{id: 'a'}],
      };
      const procedureTypesToHide = ['procedures_defnoreturn'];
      const result = moveHiddenProcedures(source, procedureTypesToHide);
      expect(result).to.deep.equal({
        mainSource: {blocks: {blocks: []}, procedures: [{id: 'a'}]},
        hiddenDefinitionSource: {
          blocks: {
            blocks: [
              {
                type: 'procedures_defnoreturn',
                id: 1,
                extraState: {procedureId: 'nonexistent'},
              },
            ],
          },
          procedures: [],
        },
      });
    });

    it('should hide multiple procedure types', () => {
      const source = {
        blocks: {
          blocks: [
            {type: 'when_run', id: 1},
            {
              type: 'procedures_defnoreturn',
              id: 2,
              extraState: {procedureId: 'a'},
            },
            {
              type: 'behavior_definition',
              id: 3,
              extraState: {procedureId: 'b'},
            },
          ],
        },
        procedures: [{id: 'a'}, {id: 'b'}],
      };
      const procedureTypesToHide = [
        'procedures_defnoreturn',
        'behavior_definition',
      ];
      const result = moveHiddenProcedures(source, procedureTypesToHide);
      expect(result).to.deep.equal({
        mainSource: {
          blocks: {blocks: [{type: 'when_run', id: 1}]},
          procedures: [{id: 'a'}, {id: 'b'}],
        },
        hiddenDefinitionSource: {
          blocks: {
            blocks: [
              {
                type: 'procedures_defnoreturn',
                id: 2,
                extraState: {procedureId: 'a'},
              },
              {
                type: 'behavior_definition',
                id: 3,
                extraState: {procedureId: 'b'},
              },
            ],
          },
          procedures: [{id: 'a'}, {id: 'b'}],
        },
      });
    });
  });

  describe('getCode', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Blockly.Xml methods when getSourceAsJson is false', () => {
      const workspaceStub = {};
      const blockSpaceToDomStub = sandbox
        .stub(Blockly.Xml, 'blockSpaceToDom')
        .returns('dom');
      const domToTextStub = sandbox
        .stub(Blockly.Xml, 'domToText')
        .returns('xml_text');

      const result = getCode(workspaceStub, false);
      expect(blockSpaceToDomStub).to.have.been.calledWith(workspaceStub);
      expect(domToTextStub).to.have.been.calledWith('dom');
      expect(result).to.equal('xml_text');
    });

    it('should call getCombinedSerialization and stringify result when getSourceAsJson is true', () => {
      const workspaceStub = {};
      const hiddenWorkspaceStub = {};
      const singleSerializationStub = {blocks: {blocks: []}, procedures: []};
      const combinedSerializationStub = {blocks: {blocks: []}, procedures: []};

      Blockly.serialization = {
        workspaces: {save: () => {}},
      };
      const saveStub = sandbox
        .stub(Blockly.serialization.workspaces, 'save')
        .returns(singleSerializationStub);

      const getHiddenDefinitionWorkspaceStub = sandbox
        .stub(Blockly, 'getHiddenDefinitionWorkspace')
        .returns(hiddenWorkspaceStub);
      const getCombinedSerializationStub = sandbox
        .stub(cdoSerializationHelpers, 'getCombinedSerialization')
        .returns(combinedSerializationStub);

      const result = getCode(workspaceStub, true);

      expect(saveStub).to.have.been.calledTwice;
      expect(getHiddenDefinitionWorkspaceStub).to.have.been.calledOnce;
      expect(getCombinedSerializationStub).to.have.been.calledOnce;
      expect(getCombinedSerializationStub.getCall(0).args).to.deep.equal([
        singleSerializationStub,
        singleSerializationStub,
      ]);
      expect(result).to.equal(JSON.stringify(combinedSerializationStub));
    });

    it('should call getCombinedSerialization and with a null second argument if the hidden workspace does not exist', () => {
      const workspaceStub = {};
      const singleSerializationStub = {blocks: {blocks: []}, procedures: []};
      const combinedSerializationStub = {blocks: {blocks: []}, procedures: []};

      Blockly.serialization = {
        workspaces: {save: () => {}},
      };
      const saveStub = sandbox
        .stub(Blockly.serialization.workspaces, 'save')
        .returns(singleSerializationStub);

      const getHiddenDefinitionWorkspaceStub = sandbox
        .stub(Blockly, 'getHiddenDefinitionWorkspace')
        .returns(undefined);
      const getCombinedSerializationStub = sandbox
        .stub(cdoSerializationHelpers, 'getCombinedSerialization')
        .returns(combinedSerializationStub);

      const result = getCode(workspaceStub, true);

      expect(saveStub).to.have.been.calledOnce;
      expect(getHiddenDefinitionWorkspaceStub).to.have.been.calledOnce;
      expect(getCombinedSerializationStub).to.have.been.calledOnce;
      expect(getCombinedSerializationStub.getCall(0).args).to.deep.equal([
        singleSerializationStub,
        null,
      ]);
      expect(result).to.equal(JSON.stringify(combinedSerializationStub));
    });
  });
});
