import React from 'react';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import Button from '../../../../src/templates/Button';
import SchoolInfoInputs from '@cdo/apps/templates/SchoolInfoInputs';
import SchoolInfoInterstitial from '@cdo/apps/lib/ui/SchoolInfoInterstitial';
import SchoolInfoConfirmationDialog from '@cdo/apps/lib/ui/SchoolInfoConfirmationDialog';

describe('SchoolInfoConfirmationDialog', () => {
  const MINIMUM_PROPS = {
    scriptData: {
      formUrl: '',
      authTokenName: 'auth_token',
      authTokenValue: 'fake_auth_token',
      existingSchoolInfo: {}
    },
    onClose: function() {}
  };

  it('renders the schoolinfointerstitial form', () => {
    const wrapper = shallow(
      <SchoolInfoConfirmationDialog
        {...MINIMUM_PROPS}
        scriptData={{
          ...MINIMUM_PROPS.scriptData,
          existingSchoolInfo: {
            country: 'US'
          }
        }}
      />
    );

    wrapper.instance().setState({showSchoolInterstitial: true});
    expect(wrapper.find(SchoolInfoInterstitial)).to.have.lengthOf(1);
  });

  it('renders the school info confirmation dialog', () => {
    const wrapper = shallow(
      <SchoolInfoConfirmationDialog
        {...MINIMUM_PROPS}
        scriptData={{
          ...MINIMUM_PROPS.scriptData,
          existingSchoolInfo: {
            country: 'US'
          }
        }}
      />
    );

    expect(wrapper.find(Body)).to.have.lengthOf(1);
  });

  it('simulates click events - save button', () => {
    const wrapper = mount(
      <SchoolInfoConfirmationDialog
        {...MINIMUM_PROPS}
        scriptData={{
          ...MINIMUM_PROPS.scriptData,
          existingSchoolInfo: {
            country: 'US'
          }
        }}
      />
    );
    const handleClickSaveStub = sinon.stub(
      wrapper.instance(),
      'handleClickSave'
    );
    handleClickSaveStub.callsFake(() => {});
    wrapper.instance().setState({showSchoolInterstitial: true});
    wrapper.find('Button');

    expect(wrapper.find('Button').length).to.equal(1);
  });

  it('simulates click events - 2 buttons', () => {
    const wrapper = mount(
      <SchoolInfoConfirmationDialog
        {...MINIMUM_PROPS}
        scriptData={{
          ...MINIMUM_PROPS.scriptData,
          existingSchoolInfo: {
            country: 'US'
          }
        }}
      />
    );
    const handleClickUpdateStub = sinon.stub(
      wrapper.instance(),
      'handleClickUpdate'
    );
    handleClickUpdateStub.callsFake(() => {});
    wrapper.instance().setState({showSchoolInterstitial: false});
    wrapper.find('Button');
    expect(wrapper.find('Button').length).to.equal(2);
  });

  describe('', () => {
    let server;

    beforeEach(() => {
      server = sinon.fakeServer.create();
    });

    afterEach(() => server.restore());

    describe('handleClickYes', () => {
      const wrapper = mount(
        <SchoolInfoConfirmationDialog
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'US'
            }
          }}
        />
      );

      it('calls handleClickYes when the yes button is clicked', () => {
        const fakeSchoolInfoId = 1;
        const handleClickYes = sinon.spy();
        server.respondWith(
          'PATCH',
          `/api/v1/user_school_infos/${fakeSchoolInfoId}/
        update_last_confirmation_date`,
          [200, {'Content-Type': 'application/json'}, '']
        );

        // const handleClickYesStub = sinon.stub(
        //   wrapper.instance(),
        //   'handleClickYes'
        // );

        // handleClickYesStub.callsFake(() => {});
        // wrapper.instance().setState({showSchoolInterstitial: false});
        // wrapper
        //   .find('Button')
        //   .at(0)
        //   .simulate('click');
        server.respond();
        expect(handleClickYes).to.have.been.calledOnce;
      });
    });
  });
});
