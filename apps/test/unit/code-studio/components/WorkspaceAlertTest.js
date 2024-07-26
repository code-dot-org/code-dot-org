import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import WorkspaceAlert from '@cdo/apps/code-studio/components/WorkspaceAlert';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('WorkspaceAlert', () => {
  let jQueryHeight;
  let jQueryWidth;
  beforeEach(() => {
    jQueryHeight = sinon.stub($.fn, 'height');
    jQueryWidth = sinon.stub($.fn, 'width');
  });

  afterEach(() => {
    $.fn.height.restore();
    $.fn.width.restore();
  });
  it('can be at the top', () => {
    jQueryHeight.returns(4);
    const top = mount(
      <WorkspaceAlert
        type="warning"
        onClose={() => {}}
        isBlockly={true}
        displayBottom={false}
      >
        <span>This is a top alert</span>
      </WorkspaceAlert>
    );
    expect(jQueryHeight.callCount).to.equal(1);
    expect(jQueryHeight.thisValues[0].selector).to.equal('#headers');
    expect(top.find('div').first().props().style.top).to.equal(4);
  });

  it('can be at the bottom', () => {
    const bottom = mount(
      <WorkspaceAlert
        type="warning"
        onClose={() => {}}
        isBlockly={true}
        displayBottom={true}
      >
        <span>This is a bottom alert</span>
      </WorkspaceAlert>
    );
    expect(bottom.find('div').first().props().style.bottom).to.equal(0);
  });

  it('isBlockly uses #toolbox-header for left', () => {
    jQueryWidth.onCall(0).returns(1);
    const isBlockly = mount(
      <WorkspaceAlert
        type="warning"
        onClose={() => {}}
        isBlockly={true}
        displayBottom={true}
      >
        <span>This is a blockly alert</span>
      </WorkspaceAlert>
    );
    expect(jQueryWidth.callCount).to.equal(1);
    expect(jQueryWidth.thisValues[0].selector).to.equal('#toolbox-header');
    expect(isBlockly.find('div').first().props().style.left).to.equal(1);
  });

  it('not isBlockly uses .droplet-gutter and .droplet-palette-element for left', () => {
    jQueryWidth.onCall(0).returns(1).returns(2);
    const neither = mount(
      <WorkspaceAlert
        type="warning"
        onClose={() => {}}
        isBlockly={false}
        displayBottom={true}
      >
        <span>This is not a blockly alert</span>
      </WorkspaceAlert>
    );
    expect(neither.find('div').first().props().style.left).to.equal(3);
    expect(jQueryWidth.callCount).to.equal(2);
    expect(jQueryWidth.thisValues[0].selector).to.equal(
      '.droplet-palette-element'
    );
    expect(jQueryWidth.thisValues[1].selector).to.equal('.droplet-gutter');
  });
});
