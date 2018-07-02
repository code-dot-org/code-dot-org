import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import SchoolInfoInputs from '@cdo/apps/templates/SchoolInfoInputs';
import SchoolInfoInterstitial from '@cdo/apps/lib/ui/SchoolInfoInterstitial';
import firehoseClient from '@cdo/apps/lib/util/firehose';

describe('SchoolInfoInterstitial', () => {
  const MINIMUM_PROPS = {
    scriptData: {
      formUrl: '',
      authTokenName: 'auth_token',
      authTokenValue: 'fake_auth_token',
      existingSchoolInfo: {},
    },
    onClose: function () {},
  };

  beforeEach(() => sinon.stub(firehoseClient, 'putRecord'));
  afterEach(() => firehoseClient.putRecord.restore());

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
              schoolLocation={''}
              useGoogleLocationSearch={true}
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
        schoolLocation={''}
        useGoogleLocationSearch={true}
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
            school_id: '123',
            country: 'United States',
            school_type: 'public',
            school_name: 'Test School',
            full_address: 'Seattle',
          },
        }}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <SchoolInfoInputs
        country={'United States'}
        schoolType={'public'}
        ncesSchoolId={'123'}
        schoolName={'Test School'}
        schoolLocation={'Seattle'}
        useGoogleLocationSearch={true}
        onCountryChange={wrapper.instance().onCountryChange}
        onSchoolTypeChange={wrapper.instance().onSchoolTypeChange}
        onSchoolChange={wrapper.instance().onSchoolChange}
        onSchoolNotFoundChange={wrapper.instance().onSchoolNotFoundChange}
      />
    );
  });

  it('interprets initial country "US" as "United States"', () => {
    const wrapper = shallow(
      <SchoolInfoInterstitial
        {...MINIMUM_PROPS}
        scriptData={{
          ...MINIMUM_PROPS.scriptData,
          existingSchoolInfo: {
            country: 'US',
          },
        }}
      />
    );
    expect(wrapper.find(SchoolInfoInputs)).to.have.prop('country', 'United States');
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
              school_id: '123',
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
              country: 'Canada',
              school_type: 'public',
              school_name: 'Test School Name',
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
              country: 'United States',
              school_type: 'homeschool',
              school_name: 'Test School Name',
            },
          }}
        />
      );
      expect(wrapper.find(SchoolInfoInputs)).to.have.prop('ncesSchoolId', '');
    });

    it('is blank if none of school name/address have been entered', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'United States',
              school_type: 'public',
              school_name: '',
              full_address: '',
            },
          }}
        />
      );
      expect(wrapper.find(SchoolInfoInputs)).to.have.prop('ncesSchoolId', '');
    });

    // Matrix of conditions where NCES ID initializes to "-1":
    ['public', 'private', 'charter'].forEach((schoolType) => {
      ['school_name', 'full_address'].forEach((schoolDetailFieldName) => {
        it(`is "-1" if country is US and schoolType is ${schoolType} and ${schoolDetailFieldName} was provided`, () => {
          const wrapper = shallow(
            <SchoolInfoInterstitial
              {...MINIMUM_PROPS}
              scriptData={{
                ...MINIMUM_PROPS.scriptData,
                existingSchoolInfo: {
                  country: 'United States',
                  school_type: schoolType,
                  school_name: '',
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

  describe('form submission', () => {
    let server;

    beforeEach(() => {
      server = sinon.createFakeServer();
    });

    afterEach(() => {
      server.restore();
    });

    it('submits with no info', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {},
          }}
        />
      );
      wrapper.find(Button).simulate('click');
      expect(server.requests[0].requestBody).to.equal([
        '_method=patch',
        'auth_token=fake_auth_token',
        'user%5Bschool_info_attributes%5D%5Bcountry%5D=',
        'user%5Bschool_info_attributes%5D%5Bschool_type%5D=',
      ].join('&'));
    });

    it('submits with only country=US', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'United States',
            },
          }}
        />
      );
      wrapper.find(Button).simulate('click');
      expect(server.requests[0].requestBody).to.equal([
        '_method=patch',
        'auth_token=fake_auth_token',
        'user%5Bschool_info_attributes%5D%5Bcountry%5D=United+States',
        'user%5Bschool_info_attributes%5D%5Bschool_type%5D=',
      ].join('&'));
    });

    it('submits with US and an NCES school type', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'United States',
              school_type: 'public'
            },
          }}
        />
      );
      wrapper.find(Button).simulate('click');
      expect(server.requests[0].requestBody).to.equal([
        '_method=patch',
        'auth_token=fake_auth_token',
        'user%5Bschool_info_attributes%5D%5Bcountry%5D=United+States',
        'user%5Bschool_info_attributes%5D%5Bschool_type%5D=public',
        'user%5Bschool_info_attributes%5D%5Bschool_id%5D=',
      ].join('&'));
    });

    it('submits with US, NCES school type, and school id', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'United States',
              school_type: 'public',
              school_id: '123'
            },
          }}
        />
      );
      wrapper.find(Button).simulate('click');
      // No need to send anything but ID if it's available...
      // All other info will be backfilled from records on the server.
      expect(server.requests[0].requestBody).to.equal([
        '_method=patch',
        'auth_token=fake_auth_token',
        'user%5Bschool_info_attributes%5D%5Bschool_id%5D=123',
      ].join('&'));
    });

    it('submits with US, NCES school type, and school name', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'United States',
              school_type: 'public',
              school_name: 'Test School'
            },
          }}
        />
      );
      wrapper.find(Button).simulate('click');
      expect(server.requests[0].requestBody).to.equal([
        '_method=patch',
        'auth_token=fake_auth_token',
        'user%5Bschool_info_attributes%5D%5Bcountry%5D=United+States',
        'user%5Bschool_info_attributes%5D%5Bschool_type%5D=public',
        'user%5Bschool_info_attributes%5D%5Bschool_name%5D=Test+School',
        'user%5Bschool_info_attributes%5D%5Bfull_address%5D=',
      ].join('&'));
    });

    it('submits with US, NCES school type, name, address', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'United States',
              school_type: 'public',
              school_name: 'Test School',
              full_address: '12222 SE Sunnyside Ln',
            },
          }}
        />
      );
      wrapper.find(Button).simulate('click');
      expect(server.requests[0].requestBody).to.equal([
        '_method=patch',
        'auth_token=fake_auth_token',
        'user%5Bschool_info_attributes%5D%5Bcountry%5D=United+States',
        'user%5Bschool_info_attributes%5D%5Bschool_type%5D=public',
        'user%5Bschool_info_attributes%5D%5Bschool_name%5D=Test+School',
        'user%5Bschool_info_attributes%5D%5Bfull_address%5D=12222+SE+Sunnyside+Ln',
      ].join('&'));
    });

    it('submits with US and non-NCES school type', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'United States',
              school_type: 'organization',
            },
          }}
        />
      );
      wrapper.find(Button).simulate('click');
      expect(server.requests[0].requestBody).to.equal([
        '_method=patch',
        'auth_token=fake_auth_token',
        'user%5Bschool_info_attributes%5D%5Bcountry%5D=United+States',
        'user%5Bschool_info_attributes%5D%5Bschool_type%5D=organization',
        'user%5Bschool_info_attributes%5D%5Bschool_name%5D=',
        'user%5Bschool_info_attributes%5D%5Bfull_address%5D=',
      ].join('&'));
    });

    it('submits with US, non-NCES school type, school name', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'United States',
              school_type: 'organization',
              school_name: 'Test School',
            },
          }}
        />
      );
      wrapper.find(Button).simulate('click');
      expect(server.requests[0].requestBody).to.equal([
        '_method=patch',
        'auth_token=fake_auth_token',
        'user%5Bschool_info_attributes%5D%5Bcountry%5D=United+States',
        'user%5Bschool_info_attributes%5D%5Bschool_type%5D=organization',
        'user%5Bschool_info_attributes%5D%5Bschool_name%5D=Test+School',
        'user%5Bschool_info_attributes%5D%5Bfull_address%5D=',
      ].join('&'));
    });

    it('submits with US, non-NCES school type, school name, location', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'United States',
              school_type: 'organization',
              school_name: 'Test School',
              full_address: 'Boring, OR',
            },
          }}
        />
      );
      wrapper.find(Button).simulate('click');
      expect(server.requests[0].requestBody).to.equal([
        '_method=patch',
        'auth_token=fake_auth_token',
        'user%5Bschool_info_attributes%5D%5Bcountry%5D=United+States',
        'user%5Bschool_info_attributes%5D%5Bschool_type%5D=organization',
        'user%5Bschool_info_attributes%5D%5Bschool_name%5D=Test+School',
        'user%5Bschool_info_attributes%5D%5Bfull_address%5D=Boring%2C+OR',
      ].join('&'));
    });

    it('submits with non-US, NCES school type', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'Tanzania',
              school_type: 'public',
            },
          }}
        />
      );
      wrapper.find(Button).simulate('click');
      expect(server.requests[0].requestBody).to.equal([
        '_method=patch',
        'auth_token=fake_auth_token',
        'user%5Bschool_info_attributes%5D%5Bcountry%5D=Tanzania',
        'user%5Bschool_info_attributes%5D%5Bschool_type%5D=public',
        'user%5Bschool_info_attributes%5D%5Bschool_name%5D=',
        'user%5Bschool_info_attributes%5D%5Bfull_address%5D=',
      ].join('&'));
    });

    it('submits with non-US, NCES school type, school name', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'Tanzania',
              school_type: 'public',
              school_name: 'Test School',
            },
          }}
        />
      );
      wrapper.find(Button).simulate('click');
      expect(server.requests[0].requestBody).to.equal([
        '_method=patch',
        'auth_token=fake_auth_token',
        'user%5Bschool_info_attributes%5D%5Bcountry%5D=Tanzania',
        'user%5Bschool_info_attributes%5D%5Bschool_type%5D=public',
        'user%5Bschool_info_attributes%5D%5Bschool_name%5D=Test+School',
        'user%5Bschool_info_attributes%5D%5Bfull_address%5D=',
      ].join('&'));
    });

    it('submits with non-US, NCES school type, school name, location', () => {
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'Tanzania',
              school_type: 'public',
              school_name: 'Test School',
              full_address: 'Tanzania National Stadium, Taifa Road, Dar es Salaam, Tanzania',
            },
          }}
        />
      );
      wrapper.find(Button).simulate('click');
      expect(server.requests[0].requestBody).to.equal([
        '_method=patch',
        'auth_token=fake_auth_token',
        'user%5Bschool_info_attributes%5D%5Bcountry%5D=Tanzania',
        'user%5Bschool_info_attributes%5D%5Bschool_type%5D=public',
        'user%5Bschool_info_attributes%5D%5Bschool_name%5D=Test+School',
        'user%5Bschool_info_attributes%5D%5Bfull_address%5D=Tanzania+National+Stadium%2C+Taifa+Road%2C+Dar+es+Salaam%2C+Tanzania',
      ].join('&'));
    });

    it('closes the dialog on successful submission', () => {
      const onClose = sinon.spy();
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          onClose={onClose}
        />
      );
      wrapper.find(Button).simulate('click');
      expect(onClose).not.to.have.been.called;

      server.requests[0].respond(204, {}, '');
      expect(onClose).to.have.been.calledOnce;
    });

    it('shows an error message on first failed submission', () => {
      const onClose = sinon.spy();
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          onClose={onClose}
        />
      );
      wrapper.find(Button).simulate('click');
      server.requests[0].respond(404, {}, '');
      expect(onClose).not.to.have.been.called;
      expect(wrapper).to.containMatchingElement(
        <p>We encountered an error with your submission. Please try again.</p>
      );
    });

    it('closes the dialog on a second failed submission', () => {
      const onClose = sinon.spy();
      const wrapper = shallow(
        <SchoolInfoInterstitial
          {...MINIMUM_PROPS}
          onClose={onClose}
        />
      );
      wrapper.find(Button).simulate('click');
      server.requests[0].respond(404, {}, '');
      expect(onClose).not.to.have.been.called;

      wrapper.find(Button).simulate('click');
      server.requests[1].respond(404, {}, '');
      expect(onClose).to.have.been.calledOnce;
    });
  });

  // Mirrors a set of tests in
  // dashboard/test/models/school_info_test.rb
  describe('isSchoolInfoComplete', () => {
    it('is complete if all school info is provided', () => {
      expect(SchoolInfoInterstitial.isSchoolInfoComplete({
        country: 'United States',
        schoolType: 'public',
        schoolName: 'Test School',
        schoolLocation: 'Seattle, WA, USA',
        ncesSchoolId: '-1',
      })).to.be.true;
    });

    it('is complete if all school info but location is provided', () => {
      expect(SchoolInfoInterstitial.isSchoolInfoComplete({
        country: 'United States',
        schoolType: 'public',
        schoolName: 'Test School',
        schoolLocation: '',
        ncesSchoolId: '-1',
      })).to.be.true;
    });

    it('is complete if school is found by NCES id', () => {
      expect(SchoolInfoInterstitial.isSchoolInfoComplete({
        country: 'United States',
        schoolType: 'public',
        schoolName: '',
        schoolLocation: '',
        ncesSchoolId: '12345',
      })).to.be.true;
    });

    it('is complete if school type is homeschool/after school/organization/other', () => {
      expect(SchoolInfoInterstitial.isSchoolInfoComplete({
        country: 'United States',
        schoolType: 'homeschool',
        schoolName: '',
        schoolLocation: '',
        ncesSchoolId: '',
      })).to.be.true;

      expect(SchoolInfoInterstitial.isSchoolInfoComplete({
        country: 'United States',
        schoolType: 'after school',
        schoolName: '',
        schoolLocation: '',
        ncesSchoolId: '',
      })).to.be.true;

      expect(SchoolInfoInterstitial.isSchoolInfoComplete({
        country: 'United States',
        schoolType: 'organization',
        schoolName: '',
        schoolLocation: '',
        ncesSchoolId: '',
      })).to.be.true;

      expect(SchoolInfoInterstitial.isSchoolInfoComplete({
        country: 'United States',
        schoolType: 'other',
        schoolName: '',
        schoolLocation: '',
        ncesSchoolId: '',
      })).to.be.true;
    });

    it('is complete if country is not US', () => {
      expect(SchoolInfoInterstitial.isSchoolInfoComplete({
        country: 'Canada',
        schoolType: '',
        schoolName: '',
        schoolLocation: '',
        ncesSchoolId: '',
      })).to.be.true;
    });

    it('is not complete without country', () => {
      expect(SchoolInfoInterstitial.isSchoolInfoComplete({
        country: '',
        schoolType: '',
        schoolName: '',
        schoolLocation: '',
        ncesSchoolId: '',
      })).to.be.false;
    });

    it('is not complete if country is US but no school type is set', () => {
      expect(SchoolInfoInterstitial.isSchoolInfoComplete({
        country: 'United States',
        schoolType: '',
        schoolName: '',
        schoolLocation: '',
        ncesSchoolId: '',
      })).to.be.false;
    });

    it('is not complete if country is US and school type is public/private/charter but other information is missing', () => {
      expect(SchoolInfoInterstitial.isSchoolInfoComplete({
        country: 'United States',
        schoolType: 'public',
        schoolName: '',
        schoolLocation: '',
        ncesSchoolId: '',
      })).to.be.false;

      expect(SchoolInfoInterstitial.isSchoolInfoComplete({
        country: 'United States',
        schoolType: 'private',
        schoolName: '',
        schoolLocation: '',
        ncesSchoolId: '',
      })).to.be.false;

      expect(SchoolInfoInterstitial.isSchoolInfoComplete({
        country: 'United States',
        schoolType: 'charter',
        schoolName: '',
        schoolLocation: '',
        ncesSchoolId: '',
      })).to.be.false;
    });
  });
});
