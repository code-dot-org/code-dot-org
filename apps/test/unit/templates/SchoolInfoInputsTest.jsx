import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SchoolInfoInputs from '@cdo/apps/templates/SchoolInfoInputs';
import SchoolNotFound from '@cdo/apps/templates/SchoolNotFound';

const MINIMUM_PROPS = {
  onCountryChange: () => {},
  onSchoolTypeChange: () => {},
  onSchoolChange: () => {},
  onSchoolNotFoundChange: () => {},
};

describe('SchoolInfoInputs', () => {
  it('shallow-renders', () => {
    const wrapper = shallow(<SchoolInfoInputs {...MINIMUM_PROPS} />);
    expect(wrapper).not.toBeNull();
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
    expect(schoolNotFound).toBeDefined();
    expect(schoolNotFound.props()).toHaveProperty('schoolName', '');
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolType',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolCity',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty('schoolState', '');
    expect(schoolNotFound.props()).toHaveProperty('schoolZip', '');
    expect(schoolNotFound.props()).toHaveProperty('schoolLocation', '');
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
    expect(schoolNotFound).toBeDefined();
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolName',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolType',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolCity',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty('schoolState', '');
    expect(schoolNotFound.props()).toHaveProperty('schoolZip', '');
    expect(schoolNotFound.props()).toHaveProperty('schoolLocation', '');
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
    expect(schoolNotFound).toBeDefined();
    expect(schoolNotFound.props()).toHaveProperty('schoolName', '');
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolType',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolCity',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolState',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolZip',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty('schoolLocation', '');
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
    expect(schoolNotFound).toBeDefined();
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolName',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolType',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolCity',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolState',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty(
      'schoolZip',
      SchoolNotFound.OMIT_FIELD
    );
    expect(schoolNotFound.props()).toHaveProperty('schoolLocation', '');
  });
});
