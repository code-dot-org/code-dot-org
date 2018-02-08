import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import SchoolInfoInputs from '@cdo/apps/templates/SchoolInfoInputs';
import SchoolInfoInterstitial from '@cdo/apps/lib/ui/SchoolInfoInterstitial';

describe('SchoolInfoInterstitial', () => {
  const MINIMUM_PROPS = {
    scriptData: {
      formUrl: '',
      authTokenName: 'auth_token',
      authTokenValue: 'fake_auth_token',
      existingSchoolInfo: {},
    }
  };

  it('renders an uncloseable dialog with school info inputs and a save button', () => {
    const wrapper = shallow(<SchoolInfoInterstitial {...MINIMUM_PROPS}/>);
    expect(wrapper).to.containMatchingElement(
      <BaseDialog>
        <div>
          <div>
            We want to bring Computer Science to every student - help us track our progress!
          </div>
          <div>
            <p>
              Please enter your school information below.
            </p>
            <SchoolInfoInputs
              country={''}
              schoolType={''}
              ncesSchoolId={''}
              schoolName={''}
              schoolState={''}
              schoolZip={''}
              schoolLocation={''}
              useGoogleLocationSearch={false}
              showErrors={false}
              showRequiredIndicator={false}
              onCountryChange={wrapper.instance().onCountryChange}
              onSchoolTypeChange={wrapper.instance().onSchoolTypeChange}
              onSchoolChange={wrapper.instance().onSchoolChange}
              onSchoolNotFoundChange={wrapper.instance().onSchoolNotFoundChange}
            />
          </div>
          <div>
            <Button
              text={i18n.save()}
              onClick={wrapper.find(Button).prop('onClick')}
            />
          </div>
        </div>
      </BaseDialog>
    );
  });

  it('passes empty school info if created with no existing school info', () => {
    const wrapper = shallow(
      <SchoolInfoInterstitial
        {...MINIMUM_PROPS}
        scriptData={{
          ...MINIMUM_PROPS.scriptData,
          existingSchoolInfo: {},
        }}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <SchoolInfoInputs
        country={''}
        schoolType={''}
        ncesSchoolId={''}
        schoolName={''}
        schoolState={''}
        schoolZip={''}
        schoolLocation={''}
        onCountryChange={wrapper.instance().onCountryChange}
        onSchoolTypeChange={wrapper.instance().onSchoolTypeChange}
        onSchoolChange={wrapper.instance().onSchoolChange}
        onSchoolNotFoundChange={wrapper.instance().onSchoolNotFoundChange}
      />
    );
  });

  it('passes existing school info if it is provided', () => {
    const wrapper = shallow(
      <SchoolInfoInterstitial
        {...MINIMUM_PROPS}
        scriptData={{
          ...MINIMUM_PROPS.scriptData,
          existingSchoolInfo: {
            ncesSchoolId: '123',
            country: 'US',
            schoolType: 'public',
            schoolName: 'Test School',
            schoolState: 'Washington',
            schoolZip: '98109',
            schoolLocation: 'Seattle',
          },
        }}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <SchoolInfoInputs
        country={'US'}
        schoolType={'public'}
        ncesSchoolId={'123'}
        schoolName={'Test School'}
        schoolState={'Washington'}
        schoolZip={'98109'}
        schoolLocation={'Seattle'}
        onCountryChange={wrapper.instance().onCountryChange}
        onSchoolTypeChange={wrapper.instance().onSchoolTypeChange}
        onSchoolChange={wrapper.instance().onSchoolChange}
        onSchoolNotFoundChange={wrapper.instance().onSchoolNotFoundChange}
      />
    );
  });

  describe('initial NCES ID', () => {
    // Tricky behavior of inner component null (or other falsy) NCES id
    // shows the school dropdown in an initial state.  An NCES id of '-1' will
    // show the dropdown with the "I can't find my school" checkbox checked
    // so additional fields are visible.
    // We attempt to create the most appropriate initial state based on
    // previously entered information.

    it('is the provided ID if it is provided', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              ncesSchoolId: '123',
            },
          }}
        />
      );
      expect(wrapper.find(SchoolInfoInputs)).to.have.prop('ncesSchoolId', '123');
    });

    it('is blank if country is not US', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'UK',
              schoolType: 'public',
              schoolName: 'Test School Name',
            },
          }}
        />
      );
      expect(wrapper.find(SchoolInfoInputs)).to.have.prop('ncesSchoolId', '');
    });

    it('is blank if school type is not public/private/charter', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'US',
              schoolType: 'homeschool',
              schoolName: 'Test School Name',
            },
          }}
        />
      );
      expect(wrapper.find(SchoolInfoInputs)).to.have.prop('ncesSchoolId', '');
    });

    it('is blank if none of school name/state/zip have been entered', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'US',
              schoolType: 'public',
              schoolName: '',
              schoolState: '',
              schoolZip: '',
            },
          }}
        />
      );
      expect(wrapper.find(SchoolInfoInputs)).to.have.prop('ncesSchoolId', '');
    });

    // Matrix of conditions where NCES ID initializes to "-1":
    ['public', 'private', 'charter'].forEach((schoolType) => {
      ['schoolName', 'schoolState', 'schoolZip'].forEach((schoolDetailFieldName) => {
        it(`is "-1" if country is US and schoolType is ${schoolType} and ${schoolDetailFieldName} was provided`, () => {
          const wrapper = shallow(
            <SchoolInfoInterstitial
              {...MINIMUM_PROPS}
              scriptData={{
                ...MINIMUM_PROPS.scriptData,
                existingSchoolInfo: {
                  country: 'US',
                  schoolType,
                  schoolName: '',
                  schoolState: '',
                  schoolZip: '',
                  [schoolDetailFieldName]: 'provided value',
                },
              }}
            />
          );
          expect(wrapper.find(SchoolInfoInputs)).to.have.prop('ncesSchoolId', '-1');
        });
      });
    });
  });
});
