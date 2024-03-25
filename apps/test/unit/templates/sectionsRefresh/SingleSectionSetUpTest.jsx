import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import SingleSectionSetUp from '@cdo/apps/templates/sectionsRefresh/SingleSectionSetUp';
import sinon from 'sinon';
import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';

describe('SingleSectionSetUp', () => {
  it('calls updateSection when name is updated', () => {
    const updateSectionSpy = sinon.spy();
    const wrapper = shallow(
      <SingleSectionSetUp
        sectionNum={1}
        section={{}}
        updateSection={updateSectionSpy}
        isNewSection={true}
      />
    );

    wrapper
      .find('input')
      .at(0)
      .simulate('change', {target: {value: 'Section 1'}});
    expect(updateSectionSpy).to.have.been.calledOnce;
  });

  it('renders Chips with expected props', () => {
    const wrapper = shallow(
      <SingleSectionSetUp
        sectionNum={1}
        section={{participantType: 'student'}}
        updateSection={() => {}}
        isNewSection={false}
      />
    );

    const chips = wrapper.find('Chips');
    expect(chips.length).to.equal(1);
    expect(chips.prop('name')).to.eq('grades');
    expect(chips.prop('required')).to.eq(true);
    expect(chips.prop('options').length).to.eq(14); // K + 12 + Other
    expect(chips.prop('values')).to.eql([]);
  });

  it('does not render grade selector when participantType is teacher', () => {
    const wrapper = shallow(
      <SingleSectionSetUp
        sectionNum={1}
        section={{participantType: ParticipantAudience.teacher}}
        updateSection={() => {}}
        isNewSection={false}
      />
    );

    expect(wrapper.find('Chips').length).to.equal(0);
  });

  it('calls updateSection when grade selection is updated', () => {
    const updateSectionSpy = sinon.spy();
    const wrapper = mount(
      <SingleSectionSetUp
        sectionNum={1}
        section={{participantType: ParticipantAudience.student}}
        updateSection={updateSectionSpy}
        isNewSection={false}
      />
    );

    const checkbox = wrapper.find('input[type="checkbox"]').at(0);
    checkbox.simulate('change', {
      target: {setCustomValidity: () => {}, checked: true},
    });
    expect(updateSectionSpy).to.have.been.calledOnce;
  });
});
