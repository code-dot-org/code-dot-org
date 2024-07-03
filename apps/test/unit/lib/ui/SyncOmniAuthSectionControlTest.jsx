import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {stub} from 'sinon';

import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import {
  UnconnectedSyncOmniAuthSectionControl as SyncOmniAuthSectionControl,
  SyncOmniAuthSectionButton,
  READY,
  IN_PROGRESS,
  SUCCESS,
  DISABLED,
} from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import * as utils from '@cdo/apps/utils';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';



describe('SyncOmniAuthSectionControl', () => {
  let updateRoster, testSyncSucceeds, testSyncFails, defaultProps;

  // This component depends on an async action (passed as the 'updateRoster'
  // prop) to update its state.  We provide a fake updateRoster action in our
  // tests that we can resolve or reject manually, and our afterEach step
  // ensures we resolve our promise and 'close the loop' on all async operations
  // before we end the test case.
  beforeEach(() => {
    stub(utils, 'reload');

    const promise = new Promise((resolve, reject) => {
      testSyncSucceeds = () => {
        testSyncSucceeds && resolve();
        testSyncSucceeds = testSyncFails = undefined;
        return promise;
      };
      testSyncFails = () => {
        testSyncFails && reject(new Error('Intentional test failure'));
        testSyncSucceeds = testSyncFails = undefined;
        return promise;
      };
    });
    updateRoster = stub().returns(promise);

    defaultProps = {
      sectionId: 1111,
      sectionCode: 'G-123456',
      sectionName: 'Test Google Classroom Section',
      sectionProvider: OAuthSectionTypes.google_classroom,
      sectionProviderName: 'Google Classroom',
      updateRoster: updateRoster,
    };
  });

  afterEach(() => {
    return (testSyncSucceeds ? testSyncSucceeds() : Promise.resolve()).then(
      () => utils.reload.restore()
    );
  });

  it('initially renders in ready state', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    expect(
      wrapper.containsMatchingElement(
        <SyncOmniAuthSectionButton
          provider={defaultProps.sectionProvider}
          providerName={defaultProps.sectionProviderName}
          buttonState={READY}
        />
      )
    ).toBe(true);
  });

  it('renders nothing if provider is not recognized', () => {
    // The usual case - null provider, for regular email or picture sections.
    const wrapper = shallow(
      <SyncOmniAuthSectionControl {...defaultProps} sectionProvider={null} />
    );
    expect(wrapper.isEmptyRender()).toBe(true);

    // Edge case - a provider name, but not one we currently support for imports.
    const wrapper2 = shallow(
      <SyncOmniAuthSectionControl
        {...defaultProps}
        sectionProvider={'microsoft_classroom'}
      />
    );
    expect(wrapper2.isEmptyRender()).toBe(true);
  });

  it('renders nothing if no section code is given', () => {
    // This usually means we're still async-loading section data
    const wrapper = shallow(
      <SyncOmniAuthSectionControl {...defaultProps} sectionCode={null} />
    );
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('calls updateRoster when clicked', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.find(SyncOmniAuthSectionButton).simulate('click');
    expect(updateRoster).toHaveBeenCalledTimes(1);
  });
  describe('Strips the prefix from the sectionCode to generate course ID', () => {
    it('G-', () => {
      const wrapper = shallow(
        <SyncOmniAuthSectionControl {...defaultProps} sectionCode="G-54321" />
      );
      wrapper.find(SyncOmniAuthSectionButton).simulate('click');
      expect(updateRoster).toHaveBeenCalledWith('54321');
    });

    it('C-', () => {
      const wrapper = shallow(
        <SyncOmniAuthSectionControl {...defaultProps} sectionCode="C-2468" />
      );
      wrapper.find(SyncOmniAuthSectionButton).simulate('click');
      expect(updateRoster).toHaveBeenCalledWith('2468');
    });
  });

  it('goes into an in-progress state when clicked', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.find(SyncOmniAuthSectionButton).simulate('click');
    expect(
      wrapper.containsMatchingElement(
        <SyncOmniAuthSectionButton
          provider={defaultProps.sectionProvider}
          providerName={defaultProps.sectionProviderName}
          buttonState={IN_PROGRESS}
        />
      )
    ).toBe(true);
  });

  it('does not respond to clicks in the in-progress state', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.find(SyncOmniAuthSectionButton).simulate('click');
    expect(
      wrapper.find(SyncOmniAuthSectionButton).prop('buttonState')
    ).toBe(IN_PROGRESS);

    wrapper.find(SyncOmniAuthSectionButton).simulate('click');
    expect(
      wrapper.find(SyncOmniAuthSectionButton).prop('buttonState')
    ).toBe(IN_PROGRESS);
  });

  it('goes into a success state when sync succeeds', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.find(SyncOmniAuthSectionButton).simulate('click');
    return expect(testSyncSucceeds()).to.be.fulfilled.then(() => {
      expect(
        wrapper.containsMatchingElement(
          <SyncOmniAuthSectionButton
            provider={defaultProps.sectionProvider}
            providerName={defaultProps.sectionProviderName}
            buttonState={SUCCESS}
          />
        )
      ).toBe(true);
    });
  });

  it('reloads the page when sync succeeds', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.find(SyncOmniAuthSectionButton).simulate('click');
    return expect(testSyncSucceeds()).to.be.fulfilled.then(() => {
      expect(utils.reload).toHaveBeenCalledTimes(1);
    });
  });

  it('does not respond to clicks in the success state', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.find(SyncOmniAuthSectionButton).simulate('click');
    return expect(testSyncSucceeds()).to.be.fulfilled.then(() => {
      expect(
        wrapper.find(SyncOmniAuthSectionButton).prop('buttonState')
      ).toBe(SUCCESS);

      // Now that we're in a success state, test that we stay
      // in it on click!
      wrapper.find(SyncOmniAuthSectionButton).simulate('click');
      expect(
        wrapper.find(SyncOmniAuthSectionButton).prop('buttonState')
      ).toBe(SUCCESS);
    });
  });

  it('Shows error Dialog when sync fails', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.find(SyncOmniAuthSectionButton).simulate('click');
    return expect(testSyncFails()).to.be.rejected.then(() => {
      expect(wrapper.find(BaseDialog).prop('isOpen')).toBe(true);
    });
  });

  it('When clicked Close on the Error Dialog, closes Error Dialog and \
    Sync Button returns to ready state ', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.find(SyncOmniAuthSectionButton).simulate('click');
    return expect(testSyncFails()).to.be.rejected.then(() => {
      expect(
        wrapper.find(SyncOmniAuthSectionButton).prop('buttonState')
      ).toBe(IN_PROGRESS);
      expect(wrapper.find(BaseDialog).prop('isOpen')).toBe(true);
      // Now that we're in a failure state, test that we stay
      // in it on click!
      wrapper.find(BaseDialog).find(Button).simulate('click');
      expect(wrapper.find(BaseDialog).prop('isOpen')).toBe(false);
      expect(
        wrapper.find(SyncOmniAuthSectionButton).prop('buttonState')
      ).toBe(READY);
    });
  });

  it('Disables the button when the section is of type LTI and syncEnabled is false', () => {
    const wrapper = shallow(
      <SyncOmniAuthSectionControl
        {...defaultProps}
        sectionProvider={SectionLoginType.lti_v1}
        syncEnabled={false}
      />
    );
    const button = wrapper.find(SyncOmniAuthSectionButton);
    expect(button.prop('buttonState')).toBe(DISABLED);
  });
});
