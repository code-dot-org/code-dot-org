import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import SingleSectionSetUp from '@cdo/apps/templates/sectionsRefresh/SingleSectionSetUp';
import sinon from 'sinon';

describe('SingleSectionSetUp', () => {
  it('calls updateSection when name is updated', () => {
    const updateSectionSpy = sinon.spy();
    const wrapper = shallow(
      <SingleSectionSetUp
        sectionNum={1}
        section={{}}
        updateSection={updateSectionSpy}
      />
    );

    wrapper
      .find('input')
      .at(0)
      .simulate('change', {target: {value: 'Section 1'}});
    expect(updateSectionSpy).to.have.been.calledOnce;
  });

  it('renders MultiSelectGroup with expected props', () => {
    const wrapper = shallow(
      <SingleSectionSetUp
        sectionNum={1}
        section={{}}
        updateSection={() => {}}
      />
    );

    const multiSelectGroup = wrapper.find('MultiSelectGroup');
    expect(multiSelectGroup.prop('name')).to.eq('grades');
    expect(multiSelectGroup.prop('required')).to.eq(true);
    expect(multiSelectGroup.prop('options').length).to.eq(14); // K + 12 + Other
    expect(multiSelectGroup.prop('values')).to.eql([]);
  });

  it('calls updateSection when grade selection is updated', () => {
    const updateSectionSpy = sinon.spy();
    const wrapper = mount(
      <SingleSectionSetUp
        sectionNum={1}
        section={{}}
        updateSection={updateSectionSpy}
      />
    );

    const checkbox = wrapper.find('input[type="checkbox"]').at(0);
    checkbox.simulate('change', {
      target: {setCustomValidity: () => {}, checked: true}
    });
    expect(updateSectionSpy).to.have.been.calledOnce;
  });
});
