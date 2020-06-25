import React from 'react';
import {expect} from '../../../util/deprecatedChai';
import {mount} from 'enzyme';
import WorkspaceAlert from '@cdo/apps/code-studio/components/WorkspaceAlert';
import $ from 'jquery';
import sinon from 'sinon';

describe('WorkspaceAlert', () => {
  it('can be at the top or bottom', () => {
    var jQueryHeight = sinon.stub($.fn, 'height').returns(4);
    const top = mount(
      <WorkspaceAlert
        type="warning"
        onClose={() => {}}
        isBlockly={true}
        isCraft={false}
        displayBottom={false}
      >
        <span>This is a top alert</span>
      </WorkspaceAlert>
    );
    expect(jQueryHeight.callCount).to.equal(1);
    expect(jQueryHeight.thisValues[0].selector).to.equal('#headers');
    expect(top).to.have.style('top', '4px');

    const bottom = mount(
      <WorkspaceAlert
        type="warning"
        onClose={() => {}}
        isBlockly={true}
        isCraft={false}
        displayBottom={true}
      >
        <span>This is a bottom alert</span>
      </WorkspaceAlert>
    );
    expect(bottom).to.have.style('bottom', '0px');
  });

  it('left changes based on isBlockly and isCraft', () => {
    var jQueryWidth = sinon
      .stub($.fn, 'width')
      .onCall(0)
      .returns(1)
      .onCall(1)
      .returns(2)
      .onCall(2)
      .returns(3)
      .onCall(3)
      .returns(4)
      .returns(0);
    const isBlocklyAndisCraft = mount(
      <WorkspaceAlert
        type="warning"
        onClose={() => {}}
        isBlockly={true}
        isCraft={true}
        displayBottom={true}
      >
        <span>This is a craft and blockly alert</span>
      </WorkspaceAlert>
    );
    expect(jQueryWidth.callCount).to.equal(1);
    expect(jQueryWidth.thisValues[0].selector).to.equal('#toolbox-header');
    expect(isBlocklyAndisCraft).to.have.style('left', '1px');

    const isBlockly = mount(
      <WorkspaceAlert
        type="warning"
        onClose={() => {}}
        isBlockly={true}
        isCraft={false}
        displayBottom={true}
      >
        <span>This is a blockly alert</span>
      </WorkspaceAlert>
    );
    expect(jQueryWidth.callCount).to.equal(2);
    expect(jQueryWidth.thisValues[1].selector).to.equal('.blocklyToolboxDiv');
    expect(isBlockly).to.have.style('left', '2px');

    const neither = mount(
      <WorkspaceAlert
        type="warning"
        onClose={() => {}}
        isBlockly={false}
        isCraft={false}
        displayBottom={true}
      >
        <span>This is a neither craft nor blockly alert</span>
      </WorkspaceAlert>
    );
    expect(neither).to.have.style('left', '7px');
    expect(jQueryWidth.callCount).to.equal(4);
    expect(jQueryWidth.thisValues[2].selector).to.equal(
      '.droplet-palette-element'
    );
    expect(jQueryWidth.thisValues[3].selector).to.equal('.droplet-gutter');
  });
});
