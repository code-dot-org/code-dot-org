import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import WorkspaceAlert from '@cdo/apps/code-studio/components/WorkspaceAlert';
import $ from 'jquery';
import sinon from 'sinon';

describe('WorkspaceAlert', () => {
  //let jQueryHeight;
  /*beforeEach() => {
    // do all the stubs for all the tests - width and height
  }
  afterEach() => {
    $.fn.height.restore();// fix this
    //jQueryHeight.restore();
  }*/
  it('can be at the top', () => {
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
    expect(
      top
        .find('div')
        .first()
        .props().style.top
    ).to.equal(4);

    $.fn.height.restore();
  });

  it('can be at the bottom', () => {
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
    expect(
      bottom
        .find('div')
        .first()
        .props().style.bottom
    ).to.equal(0);
  });

  it('isBlockly and isCraft uses #toolbox-header for left', () => {
    var jQueryWidth = sinon
      .stub($.fn, 'width')
      .onCall(0)
      .returns(1);
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
    expect(
      isBlocklyAndisCraft
        .find('div')
        .first()
        .props().style.left
    ).to.equal(1);

    $.fn.width.restore();
  });

  it('isBlockly and not isCraft uses .blocklyToolboxDiv for left', () => {
    var jQueryWidth = sinon
      .stub($.fn, 'width')
      .onCall(0)
      .returns(1);
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
    expect(jQueryWidth.callCount).to.equal(1);
    expect(jQueryWidth.thisValues[1].selector).to.equal('.blocklyToolboxDiv');
    expect(
      isBlockly
        .find('div')
        .first()
        .props().style.left
    ).to.equal(1);

    $.fn.width.restore();
  });

  it('not isBlockly and not isCraft uses .droplet-gutter and .droplet-palette-element for left', () => {
    var jQueryWidth = sinon
      .stub($.fn, 'width')
      .onCall(0)
      .returns(1)
      .returns(2);
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
    expect(
      neither
        .find('div')
        .first()
        .props().style.left
    ).to.equal(3);
    expect(jQueryWidth.callCount).to.equal(2);
    expect(jQueryWidth.thisValues[2].selector).to.equal(
      '.droplet-palette-element'
    );
    expect(jQueryWidth.thisValues[3].selector).to.equal('.droplet-gutter');

    $.fn.width.restore();
  });
});
