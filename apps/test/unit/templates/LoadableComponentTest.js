import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import LoadableComponent from '@cdo/apps/templates/LoadableComponent';

describe('LoadableComponent', () => {
  let loadFunction, loadArgs, renderFunction, renderedText, errorMessage;

  beforeEach(() => {
    renderedText = 'component';
    errorMessage = 'error';
    loadFunction = jest.fn();
    loadArgs = ['arg1', 'arg2'];
    renderFunction = jest.fn().mockReturnValue(<div>{renderedText}</div>);
  });

  it('displays a loading spinner before component loads', () => {
    const wrapper = mount(
      <LoadableComponent
        loadFunction={loadFunction}
        loadArgs={loadArgs}
        renderFunction={renderFunction}
      />
    );

    expect(wrapper.find(Spinner).length).toBe(1);
  });

  it('displays loaded component after load function completes', () => {
    const renderArgs = ['render1', 'render2'];
    loadFunction = (arg1, arg2, onLoadSuccess, onError) => {
      onLoadSuccess(renderArgs);
    };

    const wrapper = mount(
      <LoadableComponent
        loadFunction={loadFunction}
        loadArgs={loadArgs}
        renderFunction={renderFunction}
      />
    );

    expect(wrapper.find(Spinner).length).toBe(0);
    expect(wrapper.text()).toBe(renderedText);
    expect(renderFunction).toHaveBeenCalledWith(renderArgs[0], renderArgs[1]);
  });

  it('displays error message if load function produces an error', () => {
    loadFunction = (arg1, arg2, onLoadSuccess, onError) => {
      onError();
    };

    const wrapper = mount(
      <LoadableComponent
        loadFunction={loadFunction}
        loadArgs={loadArgs}
        renderFunction={renderFunction}
        errorMessage={errorMessage}
      />
    );

    expect(wrapper.find(Spinner).length).toBe(0);
    expect(wrapper.text()).toBe(errorMessage);
    expect(renderFunction).not.toHaveBeenCalled();
  });
});
