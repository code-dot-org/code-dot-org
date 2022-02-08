import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import LoadableComponent from '@cdo/apps/templates/LoadableComponent';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

describe('LoadableComponent', () => {
  let loadFunction, loadArgs, renderFunction, renderedText, errorMessage;

  beforeEach(() => {
    renderedText = 'component';
    errorMessage = 'error';
    loadFunction = sinon.stub();
    loadArgs = ['arg1', 'arg2'];
    renderFunction = sinon.stub().returns(<div>{renderedText}</div>);
  });

  it('displays a loading spinner before component loads', () => {
    const wrapper = mount(
      <LoadableComponent
        loadFunction={loadFunction}
        loadArgs={loadArgs}
        renderFunction={renderFunction}
      />
    );

    expect(wrapper.find(Spinner).length).to.equal(1);
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

    expect(wrapper.find(Spinner).length).to.equal(0);
    expect(wrapper.text()).to.equal(renderedText);
    sinon.assert.calledWith(renderFunction, renderArgs[0], renderArgs[1]);
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

    expect(wrapper.find(Spinner).length).to.equal(0);
    expect(wrapper.text()).to.equal(errorMessage);
    sinon.assert.notCalled(renderFunction);
  });
});
