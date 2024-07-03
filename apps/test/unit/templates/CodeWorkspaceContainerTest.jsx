import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import {TestableCodeWorkspaceContainer as CodeWorkspaceContainer} from '@cdo/apps/templates/CodeWorkspaceContainer';
import * as utils from '@cdo/apps/utils';



describe('CodeWorkspaceContainer', () => {
  let wrapper;

  const MINIMUM_PROPS = {
    hidden: false,
    isRtl: false,
    noVisualization: false,
  };

  beforeEach(() => {
    sinon.stub(utils, 'fireResizeEvent');
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = undefined;
    }

    utils.fireResizeEvent.restore();
  });

  it('fires a resize event on update if style.top changed', () => {
    wrapper = mount(<CodeWorkspaceContainer {...MINIMUM_PROPS} />);
    expect(utils.fireResizeEvent).not.toHaveBeenCalled();

    wrapper.setProps({style: {top: 200}});
    expect(utils.fireResizeEvent).toHaveBeenCalledTimes(1);
  });

  it('does not fire a resize event on update if style.top does not change', () => {
    wrapper = mount(
      <CodeWorkspaceContainer {...MINIMUM_PROPS} isRtl={false} />
    );
    expect(utils.fireResizeEvent).not.toHaveBeenCalled();

    wrapper.setProps({isRtl: true});
    expect(utils.fireResizeEvent).not.toHaveBeenCalled();

    wrapper.setProps({style: {left: 100}});
    expect(utils.fireResizeEvent).not.toHaveBeenCalled();
  });

  it('hidden hides the outer div', () => {
    wrapper = mount(
      <CodeWorkspaceContainer {...MINIMUM_PROPS} hidden={false} />
    );
    expect(wrapper).to.not.have.style('display', 'none');

    wrapper.setProps({hidden: true});
    expect(wrapper).to.have.style('display', 'none');
  });

  it('isRtl sets different margins', () => {
    wrapper = mount(
      <CodeWorkspaceContainer {...MINIMUM_PROPS} isRtl={false} />
    );
    expect(wrapper).to.not.have.style('left');
    expect(wrapper).to.have.style('right', '0px');
    expect(wrapper).to.have.style('marginLeft', '15px');
    expect(wrapper).to.not.have.style('marginRight');

    wrapper.setProps({isRtl: true});
    expect(wrapper).to.have.style('left', '0px');
    expect(wrapper).to.not.have.style('right');
    expect(wrapper).to.have.style('marginLeft', '0px');
    expect(wrapper).to.have.style('marginRight', '15px');
  });

  it('noVisualization overrides left margin', () => {
    wrapper = mount(
      <CodeWorkspaceContainer {...MINIMUM_PROPS} noVisualization={false} />
    );
    expect(wrapper).to.not.have.style('left');
    expect(wrapper).to.have.style('marginLeft', '15px');

    wrapper.setProps({noVisualization: true});
    expect(wrapper).to.have.style('left', '0px');
    expect(wrapper).to.have.style('marginLeft', '0px');
  });

  it('noVisualization and isRtl overrides right margin too', () => {
    wrapper = mount(
      <CodeWorkspaceContainer
        {...MINIMUM_PROPS}
        isRtl={true}
        noVisualization={false}
      />
    );
    expect(wrapper).to.have.style('left', '0px');
    expect(wrapper).to.not.have.style('right');
    expect(wrapper).to.have.style('marginLeft', '0px');

    wrapper.setProps({
      noVisualization: true,
    });
    expect(wrapper).to.have.style('left', '0px');
    expect(wrapper).to.have.style('right', '0px');
    expect(wrapper).to.have.style('marginLeft', '0px');
  });

  it('getRenderedHeight gives height of DOM node', () => {
    wrapper = mount(<CodeWorkspaceContainer {...MINIMUM_PROPS} />);
    const height = wrapper.instance().getRenderedHeight();
    expect(height).toBeInstanceOf(Number);
  });
});
