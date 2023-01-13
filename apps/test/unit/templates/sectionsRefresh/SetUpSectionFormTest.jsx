import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import SetUpSectionForm from '@cdo/apps/templates/sectionsRefresh/SetUpSectionForm';
import sinon from 'sinon';

describe('SetUpSectionForm', () => {
  it('calls updateSection when name is updated', () => {
    const updateSectionSpy = sinon.spy();
    const wrapper = shallow(
      <SetUpSectionForm
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
});
