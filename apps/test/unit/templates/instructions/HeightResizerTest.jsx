import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import HeightResizer from '@cdo/apps/templates/instructions/HeightResizer';

describe('HeightResizer', () => {
  it('handles a drag event', () => {
    const resizeItemTopCallback = jest.fn().mockReturnValue(5);
    const onResizeCallback = jest.fn();
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
      cancelable: true,
    });
    wrapper.instance().onMouseDown(mouseDownEvent);

    expect(resizeItemTopCallback).toHaveBeenCalledTimes(1);
    expect(onResizeCallback).not.toHaveBeenCalled();
    expect(mouseDownEvent.stopPropagation).toHaveBeenCalled();
    expect(mouseDownEvent.preventDefault).toHaveBeenCalled();

    // Simulate mouseMove
    const mouseMoveEvent = mouseEvent({
      pageY: 30,
      cancelable: true,
    });
    wrapper.instance().onMouseMove(mouseMoveEvent);

    expect(resizeItemTopCallback).toHaveBeenCalledTimes(2);
    expect(onResizeCallback).toHaveBeenCalledWith(10);
    expect(mouseMoveEvent.stopPropagation).toHaveBeenCalled();
    expect(mouseMoveEvent.preventDefault).toHaveBeenCalled();

    // Simulate mouseUp
    const mouseUpEvent = mouseEvent({
      button: 0,
      pageY: 40,
      cancelable: true,
    });
    wrapper.instance().onMouseUp(mouseUpEvent);

    expect(resizeItemTopCallback).toHaveBeenCalledTimes(2);
    expect(onResizeCallback).toHaveBeenCalledTimes(1);
    expect(mouseUpEvent.stopPropagation).toHaveBeenCalled();
    expect(mouseUpEvent.preventDefault).toHaveBeenCalled();
  });

  it('ignores secondary mouse buttons', () => {
    const wrapper = mount(
      <HeightResizer
        resizeItemTop={() => {}}
        position={0}
        onResize={() => {}}
      />
    );
    jest.spyOn(wrapper.instance(), 'setState').mockClear();

    // Simulate mouseDown with non-primary mouse button
    const mouseDownEvent = mouseEvent({
      button: 1,
      pageY: 20,
      cancelable: true,
    });
    wrapper.instance().onMouseDown(mouseDownEvent);

    expect(wrapper.instance().setState).not.toHaveBeenCalled();
    expect(mouseDownEvent.stopPropagation).not.toHaveBeenCalled();
    expect(mouseDownEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('ignores mouseMove events if not dragging', () => {
    const resizeItemTopCallback = jest.fn().mockReturnValue(10);
    const onResizeCallback = jest.fn();
    const wrapper = mount(
      <HeightResizer
        resizeItemTop={resizeItemTopCallback}
        position={0}
        onResize={onResizeCallback}
      />
    );
    jest.spyOn(wrapper.instance(), 'setState').mockClear();

    const mouseMoveEvent = mouseEvent({
      pageY: 30,
      cancelable: true,
    });
    wrapper.instance().onMouseMove(mouseMoveEvent);

    expect(resizeItemTopCallback).not.toHaveBeenCalled();
    expect(onResizeCallback).not.toHaveBeenCalled();
    expect(wrapper.instance().setState).not.toHaveBeenCalled();
    expect(mouseMoveEvent.stopPropagation).toHaveBeenCalled();
    expect(mouseMoveEvent.preventDefault).toHaveBeenCalled();
  });
});

function mouseEvent(props) {
  return {
    stopPropagation: jest.fn(),
    preventDefault: jest.fn(),
    ...props,
  };
}
