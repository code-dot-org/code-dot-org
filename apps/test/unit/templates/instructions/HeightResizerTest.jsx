import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import HeightResizer from '@cdo/apps/templates/instructions/HeightResizer';

describe('HeightResizer', () => {
  it('handles a drag event', () => {
    const resizeItemTopCallback = sinon.stub().returns(5);
    const onResizeCallback = sinon.stub();
    const wrapper = mount(
      <HeightResizer
        resizeItemTop={resizeItemTopCallback}
        position={0}
        onResize={onResizeCallback}
      />
    );

    // Simulate mouseDown
    const mouseDownEvent = mouseEvent({
      button: 0,
      pageY: 20,
      cancelable: true
    });
    wrapper.instance().onMouseDown(mouseDownEvent);

    expect(resizeItemTopCallback).not.to.have.been.called;
    expect(onResizeCallback).not.to.have.been.called;
    expect(mouseDownEvent.stopPropagation).to.have.been.called;
    expect(mouseDownEvent.preventDefault).to.have.been.called;

    // Simulate mouseMove
    const mouseMoveEvent = mouseEvent({
      pageY: 30,
      cancelable: true
    });
    wrapper.instance().onMouseMove(mouseMoveEvent);

    expect(resizeItemTopCallback).to.have.been.calledOnce;
    expect(onResizeCallback).to.have.been.calledOnce.and.calledWith(25);
    expect(mouseMoveEvent.stopPropagation).to.have.been.called;
    expect(mouseMoveEvent.preventDefault).to.have.been.called;

    // Simulate mouseUp
    const mouseUpEvent = mouseEvent({
      button: 0,
      pageY: 40,
      cancelable: true
    });
    wrapper.instance().onMouseUp(mouseUpEvent);

    expect(resizeItemTopCallback).to.have.been.calledOnce;
    expect(onResizeCallback).to.have.been.calledOnce;
    expect(mouseUpEvent.stopPropagation).to.have.been.called;
    expect(mouseUpEvent.preventDefault).to.have.been.called;
  });

  it('ignores secondary mouse buttons', () => {
    const wrapper = mount(
      <HeightResizer
        resizeItemTop={() => {}}
        position={0}
        onResize={() => {}}
      />
    );
    sinon.spy(wrapper.instance(), 'setState');

    // Simulate mouseDown with non-primary mouse button
    const mouseDownEvent = mouseEvent({
      button: 1,
      pageY: 20,
      cancelable: true
    });
    wrapper.instance().onMouseDown(mouseDownEvent);

    expect(wrapper.instance().setState).not.to.have.been.called;
    expect(mouseDownEvent.stopPropagation).not.to.have.been.called;
    expect(mouseDownEvent.preventDefault).not.to.have.been.called;
  });

  it('ignores mouseMove events if not dragging', () => {
    const resizeItemTopCallback = sinon.stub().returns(10);
    const onResizeCallback = sinon.stub();
    const wrapper = mount(
      <HeightResizer
        resizeItemTop={resizeItemTopCallback}
        position={0}
        onResize={onResizeCallback}
      />
    );
    sinon.spy(wrapper.instance(), 'setState');

    const mouseMoveEvent = mouseEvent({
      pageY: 30,
      cancelable: true
    });
    wrapper.instance().onMouseMove(mouseMoveEvent);

    expect(resizeItemTopCallback).not.to.have.been.called;
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
    ...props
  };
}
