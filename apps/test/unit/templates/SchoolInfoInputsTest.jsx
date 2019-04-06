import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import SchoolInfoInputs from '@cdo/apps/templates/SchoolInfoInputs';
import SchoolNotFound from '@cdo/apps/templates/SchoolNotFound';

const MINIMUM_PROPS = {
  onCountryChange: () => {},
  onSchoolTypeChange: () => {},
  onSchoolChange: () => {},
  onSchoolNotFoundChange: () => {}
};

describe('SchoolInfoInputs', () => {
  it('shallow-renders', () => {
    const wrapper = shallow(<SchoolInfoInputs {...MINIMUM_PROPS} />);
    expect(wrapper).not.to.be.null;
  });

  it('Shows SchoolNotFound to gather name, state, zip, and location when country US and school type has a name', () => {
    const wrapper = shallow(
      <SchoolInfoInputs
        {...MINIMUM_PROPS}
        country="United States"
        schoolType="public"
        ncesSchoolId="-1"
      />
    );
    const schoolNotFound = wrapper.find(SchoolNotFound);
    expect(schoolNotFound).to.exist;
    expect(schoolNotFound.prop('schoolName')).to.equal('');
    expect(schoolNotFound.prop('schoolType')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolCity')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolState')).to.equal('');
    expect(schoolNotFound.prop('schoolZip')).to.equal('');
    expect(schoolNotFound.prop('schoolLocation')).to.equal('');
  });

  it('Shows SchoolNotFound to gather state, zip, and location when country US and school type does not have a name', () => {
    const wrapper = shallow(
      <SchoolInfoInputs
        {...MINIMUM_PROPS}
        country="United States"
        schoolType="homeschool"
      />
    );
    const schoolNotFound = wrapper.find(SchoolNotFound);
    expect(schoolNotFound).to.exist;
    expect(schoolNotFound.prop('schoolName')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolType')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolCity')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolState')).to.equal('');
    expect(schoolNotFound.prop('schoolZip')).to.equal('');
    expect(schoolNotFound.prop('schoolLocation')).to.equal('');
  });

  it('Shows SchoolNotFound to gather name and location when country is not US and school type has a name', () => {
    const wrapper = shallow(
      <SchoolInfoInputs
        {...MINIMUM_PROPS}
        country="Canada"
        schoolType="public"
      />
    );
    const schoolNotFound = wrapper.find(SchoolNotFound);
    expect(schoolNotFound).to.exist;
    expect(schoolNotFound.prop('schoolName')).to.equal('');
    expect(schoolNotFound.prop('schoolType')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolCity')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolState')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolZip')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolLocation')).to.equal('');
  });

  it('Shows SchoolNotFound to gather location when country is not US and school type does not have a name', () => {
    const wrapper = shallow(
      <SchoolInfoInputs
        {...MINIMUM_PROPS}
        country="Canada"
        schoolType="homeschool"
      />
    );
    const schoolNotFound = wrapper.find(SchoolNotFound);
    expect(schoolNotFound).to.exist;
    expect(schoolNotFound.prop('schoolName')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolType')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolCity')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolState')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolZip')).to.equal(
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.prop('schoolLocation')).to.equal('');
  });
});
