import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import * as cdoSerializationHelpers from '@cdo/apps/blockly/addons/cdoSerializationHelpers';
import {getCode, moveHiddenBlocks} from '@cdo/apps/blockly/addons/cdoUtils';
import * as cdoXml from '@cdo/apps/blockly/addons/cdoXml';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import setBlocklyGlobal from '../../../util/setupBlocklyGlobal';

setBlocklyGlobal();

describe('CdoUtils', () => {
  describe('moveHiddenBlocks', () => {
    it('should not move any blocks if none have the appropriate procedure type and none are invisible', () => {
      const source = {
        blocks: {
          blocks: [{type: 'when_run', id: 1}],
        },
        procedures: [],
      };

      const typesToHide = ['procedures_defnoreturn'];
      const result = moveHiddenBlocks(source, typesToHide);
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

    it('should move all blocks if they all match a procedure type', () => {
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
      const result = moveHiddenBlocks(source, typesToHide);
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
              type: 'gamelab_everyInterval',
              id: 2,
              extraState: {invisible: true},
            },
            {
              type: 'procedures_defnoreturn',
              id: 3,
              extraState: {procedureId: 'a'},
            },
          ],
        },
        procedures: [{id: 'a'}],
      };

      const typesToHide = ['procedures_defnoreturn'];
      const result = moveHiddenBlocks(source, typesToHide);
      expect(result).to.deep.equal({
        mainSource: {
          blocks: {blocks: [{type: 'when_run', id: 1}]},
          procedures: [{id: 'a'}],
        },
        hiddenDefinitionSource: {
          blocks: {
            blocks: [
              {
                type: 'gamelab_everyInterval',
                id: 2,
                extraState: {invisible: true},
              },
              {
                type: 'procedures_defnoreturn',
                id: 3,
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
      const result = moveHiddenBlocks(source, procedureTypesToHide);
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
      const result = moveHiddenBlocks(source, procedureTypesToHide);
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
      const domToTextStub = sandbox
        .stub(Blockly.Xml, 'domToText')
        .returns('xml_text');
      const getProjectXmlStub = sandbox
        .stub(cdoXml, 'getProjectXml')
        .returns('dom');

      const result = getCode(workspaceStub, false);

      expect(getProjectXmlStub).to.have.been.calledWith(workspaceStub);
      expect(domToTextStub).to.have.been.calledWith('dom');
      expect(result).to.equal('xml_text');
    });

    it('should call getProjectSerialization when getSourceAsJson is true', () => {
      const workspaceStub = {};
      const serializationStub = {blocks: {blocks: []}, procedures: []};

      Blockly.serialization = {
        workspaces: {save: () => {}},
      };

      const getProjectSerializationStub = sandbox
        .stub(cdoSerializationHelpers, 'getProjectSerialization')
        .returns(serializationStub);

      const result = getCode(workspaceStub, true);

      expect(getProjectSerializationStub).to.have.been.calledWith(
        workspaceStub
      );

      expect(result).to.equal(JSON.stringify(serializationStub));
    });
  });
});
