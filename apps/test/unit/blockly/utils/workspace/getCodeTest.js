import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import * as cdoXml from '@cdo/apps/blockly/addons/cdoXml';
import * as serializationModule from '@cdo/apps/blockly/utils/serialization/state';
import {
  getCode,
  getCodeFromSerializedWorkspace,
} from '@cdo/apps/blockly/utils/workspace/getCode';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import setBlocklyGlobal from '../../../../util/setupBlocklyGlobal';

setBlocklyGlobal();

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

    const getProjectSerializationStub = sandbox
      .stub(serializationModule, 'getProjectSerialization')
      .returns(serializationStub);

    const result = getCode(workspaceStub, true);

    expect(getProjectSerializationStub).to.have.been.calledWith(workspaceStub);

    expect(result).to.equal(JSON.stringify(serializationStub));
  });
});

describe('getCodeFromSerializedWorkspace', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('runs prepare on the loaded workspace before generating code', () => {
    const calls = [];
    sandbox
      .stub(Blockly.serialization.workspaces, 'load')
      .callsFake(() => calls.push('load'));
    sandbox.stub(Blockly.JavaScript, 'workspaceToCode').callsFake(() => {
      calls.push('code');
      return 'generated';
    });
    const prepare = sinon.spy(workspace => {
      expect(workspace).to.be.an.instanceOf(Blockly.Workspace);
      calls.push('prepare');
    });

    expect(
      getCodeFromSerializedWorkspace({blocks: {blocks: []}}, prepare)
    ).to.equal('generated');
    expect(calls).to.deep.equal(['load', 'prepare', 'code']);
  });

  it('is empty for no source, without touching Blockly', () => {
    const prepare = sinon.spy();
    expect(getCodeFromSerializedWorkspace(undefined, prepare)).to.equal('');
    expect(prepare).not.to.have.been.called;
  });
});
