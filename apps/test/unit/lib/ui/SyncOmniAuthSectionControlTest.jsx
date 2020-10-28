import React from 'react';
import {shallow} from 'enzyme';
import {stub} from 'sinon';
import {expect} from '../../../util/deprecatedChai';
import * as utils from '@cdo/apps/utils';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import {
  UnconnectedSyncOmniAuthSectionControl as SyncOmniAuthSectionControl,
  SyncOmniAuthSectionButton,
  READY,
  IN_PROGRESS,
  SUCCESS,
  FAILURE
} from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';

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
      updateRoster: updateRoster
    };
  });

  afterEach(() => {
    return (testSyncSucceeds ? testSyncSucceeds() : Promise.resolve()).then(
      () => utils.reload.restore()
    );
  });

  it('initially renders in ready state', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    expect(wrapper).to.containMatchingElement(
      <SyncOmniAuthSectionButton
        provider={defaultProps.sectionProvider}
        buttonState={READY}
      />
    );
  });

  it('renders nothing if provider is not recognized', () => {
    // The usual case - null provider, for regular email or picture sections.
    const wrapper = shallow(
      <SyncOmniAuthSectionControl {...defaultProps} sectionProvider={null} />
    );
    expect(wrapper).to.be.blank();

    // Edge case - a provider name, but not one we currently support for imports.
    const wrapper2 = shallow(
      <SyncOmniAuthSectionControl
        {...defaultProps}
        sectionProvider={'microsoft_classroom'}
      />
    );
    expect(wrapper2).to.be.blank();
  });

  it('renders nothing if no section code is given', () => {
    // This usually means we're still async-loading section data
    const wrapper = shallow(
      <SyncOmniAuthSectionControl {...defaultProps} sectionCode={null} />
    );
    expect(wrapper).to.be.blank();
  });

  it('calls updateRoster when clicked', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.simulate('click');
    expect(updateRoster).to.have.been.calledOnce;
  });

  describe('strips the prefix from the sectionCode to generate the course ID', () => {
    it('G-', () => {
      const wrapper = shallow(
        <SyncOmniAuthSectionControl {...defaultProps} sectionCode="G-54321" />
      );
      wrapper.simulate('click');
      expect(updateRoster).to.have.been.calledWith('54321');
    });

    it('C-', () => {
      const wrapper = shallow(
        <SyncOmniAuthSectionControl {...defaultProps} sectionCode="C-2468" />
      );
      wrapper.simulate('click');
      expect(updateRoster).to.have.been.calledWith('2468');
    });
  });

  it('goes into an in-progress state when clicked', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.simulate('click');
    expect(wrapper).to.containMatchingElement(
      <SyncOmniAuthSectionButton
        provider={defaultProps.sectionProvider}
        buttonState={IN_PROGRESS}
      />
    );
  });

  it('does not respond to clicks in the in-progress state', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.simulate('click');
    expect(wrapper.find(SyncOmniAuthSectionButton)).to.have.prop(
      'buttonState',
      IN_PROGRESS
    );

    wrapper.simulate('click');
    expect(wrapper.find(SyncOmniAuthSectionButton)).to.have.prop(
      'buttonState',
      IN_PROGRESS
    );
  });

  it('goes into a success state when sync succeeds', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.simulate('click');
    return expect(testSyncSucceeds()).to.be.fulfilled.then(() => {
      expect(wrapper).to.containMatchingElement(
        <SyncOmniAuthSectionButton
          provider={defaultProps.sectionProvider}
          buttonState={SUCCESS}
        />
      );
    });
  });

  it('reloads the page when sync succeeds', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.simulate('click');
    return expect(testSyncSucceeds()).to.be.fulfilled.then(() => {
      expect(utils.reload).to.have.been.calledOnce;
    });
  });

  it('does not respond to clicks in the success state', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.simulate('click');
    return expect(testSyncSucceeds()).to.be.fulfilled.then(() => {
      expect(wrapper.find(SyncOmniAuthSectionButton)).to.have.prop(
        'buttonState',
        SUCCESS
      );

      // Now that we're in a success state, test that we stay
      // in it on click!
      wrapper.simulate('click');
      expect(wrapper.find(SyncOmniAuthSectionButton)).to.have.prop(
        'buttonState',
        SUCCESS
      );
    });
  });

  it('goes into a failure state when sync fails', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.simulate('click');
    return expect(testSyncFails()).to.be.rejected.then(() => {
      expect(wrapper).to.containMatchingElement(
        <SyncOmniAuthSectionButton
          provider={defaultProps.sectionProvider}
          buttonState={FAILURE}
        />
      );
    });
  });

  it('returns to ready state when clicked in failure state', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps} />);
    wrapper.simulate('click');
    return expect(testSyncFails()).to.be.rejected.then(() => {
      expect(wrapper.find(SyncOmniAuthSectionButton)).to.have.prop(
        'buttonState',
        FAILURE
      );

      // Now that we're in a failure state, test that we stay
      // in it on click!
      wrapper.simulate('click');
      expect(wrapper.find(SyncOmniAuthSectionButton)).to.have.prop(
        'buttonState',
        READY
      );
    });
  });
});
