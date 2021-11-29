import React from 'react';
import {Provider} from 'react-redux';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import Button from '@cdo/apps/templates/Button';
import SetUpMessage from '@cdo/apps/templates/studioHomepages/SetUpMessage';
import {UnconnectedSetUpSections as SetUpSections} from '@cdo/apps/templates/studioHomepages/SetUpSections';
import {combineReducers, createStore} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

describe('SetUpSections', () => {
  it('renders as expected', () => {
    const wrapper = shallow(
      <SetUpSections beginEditingNewSection={() => {}} />
    );
    const instance = wrapper.instance();

    expect(
      wrapper.containsMatchingElement(
        <SetUpMessage
          type="sections"
          headingText="Set up your classroom"
          descriptionText="Create a new classroom section to start assigning courses and seeing your student progress."
          buttonText="Create a section"
          onClick={instance.beginEditingNewSection}
        />
      )
    );
  });

  it('calls beginEditingNewSection with no arguments when button is clicked', () => {
    const store = createStore(combineReducers({isRtl}));
    const spy = sinon.spy();
    const wrapper = mount(
      <Provider store={store}>
        <SetUpSections beginEditingNewSection={spy} />
      </Provider>
    );
    expect(spy).not.to.have.been.called;

    wrapper.find(Button).simulate('click', {fake: 'event'});
    expect(spy).to.have.been.calledOnce;
    expect(spy.firstCall.args).to.be.empty;
  });
});
