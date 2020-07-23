import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import sinon from 'sinon';
import {
  UnconnectedVisualizationResizeBar as VisualizationResizeBar,
  RESIZE_VISUALIZATION_EVENT
} from '@cdo/apps/lib/ui/VisualizationResizeBar';

describe('VisualizationResizeBar', function() {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<VisualizationResizeBar />);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    wrapper = undefined;
  });

  it('has the id "visualizationResizeBar"', () => {
    expect(wrapper.find('div')).to.have.prop('id', 'visualizationResizeBar');
  });

  it('is configured to display a font-awesome vertical ellipsis', () => {
    expect(wrapper.find('div')).to.have.prop('className', 'fa fa-ellipsis-v');
  });

  it('responds to and reports drag events', () => {
    // Spy on resize events that this component generates.
    const spy = sinon.spy();
    window.addEventListener(RESIZE_VISUALIZATION_EVENT, spy);

    // Mouse move before mousedown doesn't create an event
    document.body.dispatchEvent(mouseEvent('mousemove', 42, 0));
    expect(spy).to.have.callCount(0);

    // Mouse down doesn't fire resize event, but does attach needed handlers
    wrapper
      .find('div')
      .instance()
      .dispatchEvent(mouseEvent('mousedown', 0, 0));
    expect(spy).to.have.callCount(0);

    // Now mouse move fires a resize event
    document.body.dispatchEvent(mouseEvent('mousemove', 42, 0));
    expect(spy).to.have.callCount(1);

    // Mouse up unhooks handlers, doesn't fire another event
    document.body.dispatchEvent(mouseEvent('mouseup', 42, 0));
    expect(spy).to.have.callCount(1);

    // Mouse move after mouseup doesn't create an event
    document.body.dispatchEvent(mouseEvent('mousemove', 64, 0));
    expect(spy).to.have.callCount(1);

    // Stop spying on resize events
    window.removeEventListener(RESIZE_VISUALIZATION_EVENT, spy);
  });
});

function mouseEvent(eventName, x, y) {
  const event = document.createEvent('MouseEvents');
  event.initMouseEvent(
    eventName,
    true,
    true,
    window,
    0,
    x,
    y,
    x,
    y,
    false,
    false,
    false,
    false,
    0,
    null
  );
  return event;
}
