import React from 'react';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import {Body} from '@cdo/apps/templates/Dialog';
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

  it('simulates click save', () => {
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

  it('confirms there are two buttons in the school information confirmation modal', () => {
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

  describe('fetch', () => {
    let stubedFetch;

    beforeEach(() => {
      stubedFetch = sinon.stub(window, 'fetch');
    });

    afterEach(() => {
      stubedFetch.restore();
    });

    describe('handleClickUpdate and handleClickYes', () => {
      const onClose = sinon.spy();
      const wrapper = mount(
        <SchoolInfoConfirmationDialog
          {...MINIMUM_PROPS}
          scriptData={{
            ...MINIMUM_PROPS.scriptData,
            existingSchoolInfo: {
              country: 'US'
            }
          }}
          onClose={onClose}
          isOpen={true}
        />
      );

      it('calls handleClickUpdate method when a user clicks the button to update school information', async () => {
        stubedFetch.resolves();
        const wrapperInstance = wrapper.instance();
        sinon.spy(wrapperInstance, 'handleClickUpdate');
        wrapper.instance().setState({showSchoolInterstitial: false});
        wrapper.find('div#update-button').simulate('click');

        expect(onClose).not.to.have.been.called;
        expect(wrapperInstance.handleClickUpdate).to.have.been.called;
        await setTimeout(() => {}, 50);
        expect(wrapper.state('showSchoolInterstitial')).to.be.true;
      });

      it('calls handleClickYes method when a user does not need to update school information', async () => {
        stubedFetch.resolves();
        const wrapperInstance = wrapper.instance();
        sinon.spy(wrapperInstance, 'handleClickYes');
        wrapper.instance().setState({showSchoolInterstitial: false});
        wrapper.find('div#yes-button').simulate('click');

        expect(wrapperInstance.handleClickYes).to.have.been.called;
        await setTimeout(() => {}, 50);
        expect(onClose).to.have.been.called;
        await setTimeout(() => {}, 50);
        expect(wrapper.state('showSchoolInterstitial')).to.be.false;
      });
    });
  });
});
