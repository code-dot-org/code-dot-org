import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import HeightResizer from '@cdo/apps/templates/instructions/HeightResizer';

describe('HeightResizer', () => {
  it('handles a drag event', () => {
    const onResizeCallback = sinon.stub().returnsArg(0);
    const wrapper = mount(
      <HeightResizer
        position={0}
        onResize={onResizeCallback}
      />
    );

    // Simulate mouseDown
    const mouseDownEvent = mouseEvent({
      button: 0,
      pageY: 20
    });
    wrapper.simulate('mouseDown', mouseDownEvent);

    expect(onResizeCallback).not.to.have.been.called;
    expect(mouseDownEvent.stopPropagation).to.have.been.called;
    expect(mouseDownEvent.preventDefault).to.have.been.called;

    // Simulate mouseMove
    const mouseMoveEvent = mouseEvent({
      pageY: 30
    });
    wrapper.simulate('mouseMove', mouseMoveEvent);

    expect(onResizeCallback).to.have.been.calledOnce
      .and.calledWith(10);
    expect(mouseMoveEvent.stopPropagation).to.have.been.called;
    expect(mouseMoveEvent.preventDefault).to.have.been.called;

    // Simulate mouseUp
    const mouseUpEvent = mouseEvent({
      button: 0,
      pageY: 40
    });
    wrapper.simulate('mouseUp', mouseUpEvent);

    expect(onResizeCallback).to.have.been.calledOnce;
    expect(mouseUpEvent.stopPropagation).to.have.been.called;
    expect(mouseUpEvent.preventDefault).to.have.been.called;
  });

  it('ignores secondary mouse buttons', () => {
    const wrapper = mount(
      <HeightResizer
        position={0}
        onResize={() => {}}
      />
    );
    sinon.spy(wrapper.instance(), 'setState');

    // Simulate mouseDown with non-primary mouse button
    const mouseDownEvent = mouseEvent({
      button: 1,
      pageY: 20
    });
    wrapper.simulate('mouseDown', mouseDownEvent);

    expect(wrapper.instance().setState).not.to.have.been.called;
    expect(mouseDownEvent.stopPropagation).not.to.have.been.called;
    expect(mouseDownEvent.preventDefault).not.to.have.been.called;
  });

  it('ignores mouseMove events if not dragging', () => {
    const onResizeCallback = sinon.stub().returnsArg(0);
    const wrapper = mount(
      <HeightResizer
        position={0}
        onResize={onResizeCallback}
      />
    );
    sinon.spy(wrapper.instance(), 'setState');

    const mouseMoveEvent = mouseEvent({
      pageY: 30
    });
    wrapper.simulate('mouseMove', mouseMoveEvent);

    expect(onResizeCallback).not.to.have.been.called;
    expect(wrapper.instance().setState).not.to.have.been.called;
    expect(mouseMoveEvent.stopPropagation).to.have.been.called;
    expect(mouseMoveEvent.preventDefault).to.have.been.called;
  });
});

function mouseEvent(props) {
  return {
    stopPropagation: sinon.spy(),
    preventDefault: sinon.spy(),
    ...props,
  };
}
