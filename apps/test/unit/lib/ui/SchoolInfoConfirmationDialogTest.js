import React from 'react';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
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

    wrapper.setState({showSchoolInterstitial: true});
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
    wrapper.setState({showSchoolInterstitial: false});
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

    describe('school info confirmation dialog behavior', () => {
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
        const wrapperInstance = wrapper.instance();
        sinon.spy(wrapperInstance, 'handleClickUpdate');
        wrapper.setState({showSchoolInterstitial: false});
        wrapper.find('div#update-button').simulate('click');

        expect(wrapperInstance.handleClickUpdate).to.have.been.called;
        await setTimeout(() => {}, 50);
        expect(wrapper.state('showSchoolInterstitial')).to.be.true;
      });

      it('calls handleClickYes method when a user does not need to update school information', async () => {
        stubedFetch.resolves();
        const wrapperInstance = wrapper.instance();
        const handleClickYesSpy = sinon.spy(wrapperInstance, 'handleClickYes');
        wrapper.setState({showSchoolInterstitial: false});
        wrapper.find('div#yes-button').simulate('click');

        expect(wrapperInstance.handleClickYes).to.have.been.called;
        await setTimeout(() => {}, 50);
        expect(onClose).to.have.been.called;
        await setTimeout(() => {}, 50);
        expect(wrapper.state('showSchoolInterstitial')).to.be.false;
        handleClickYesSpy.restore();
      });
    });
  });

  describe('when to render school info confirmation dialog', () => {
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

    it('renders school info form when school info interstitial is set to true', () => {
      const wrapperInstance = wrapper.instance();
      const renderSchoolInformationForm = sinon.spy(
        wrapperInstance,
        'renderSchoolInformationForm'
      );
      wrapper.setState({showSchoolInterstitial: true});

      expect(renderSchoolInformationForm).to.have.been.called;
    });

    it('renders school info confirmation dialog when school info interstitial is set to false', () => {
      const wrapperInstance = wrapper.instance();
      const renderSchoolInfoConfirmationDialog = sinon.spy(
        wrapperInstance,
        'renderInitialContent'
      );
      wrapper.setState({showSchoolInterstitial: false});

      expect(renderSchoolInfoConfirmationDialog).to.have.been.called;
    });
  });
});
