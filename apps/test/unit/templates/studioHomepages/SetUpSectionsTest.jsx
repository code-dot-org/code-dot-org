import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import Button from "@cdo/apps/templates/Button";
import {
  UnconnectedSetUpSections as SetUpSections,
} from '@cdo/apps/templates/studioHomepages/SetUpSections';

describe('SetUpSections', () => {
  it('renders as expected', () => {
    const wrapper = mount(
      <SetUpSections
        isRtl={false}
        beginEditingNewSection={() => {}}
      />
    );
    const instance = wrapper.instance();

    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>
            Set up your classroom
          </div>
          <div>
            Create a new classroom section to start assigning courses and seeing your student progress.
          </div>
        </div>
        <Button
          onClick={instance.beginEditingNewSection}
          color={Button.ButtonColor.gray}
          text={'Create a section'}
        />
        <div/>
      </div>
    );
  });

  it('calls beginEditingNewSection with no arguments when button is clicked', () => {
    const spy = sinon.spy();
    const wrapper = mount(
      <SetUpSections
        isRtl={false}
        beginEditingNewSection={spy}
      />
    );
    expect(spy).not.to.have.been.called;

    wrapper.find(Button).simulate('click', {fake: 'event'});
    expect(spy).to.have.been.calledOnce;
    expect(spy.firstCall.args).to.be.empty;
  });
});
