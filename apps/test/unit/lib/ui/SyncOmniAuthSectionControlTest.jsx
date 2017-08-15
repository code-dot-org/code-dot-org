import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import {OAuthSectionTypes} from '@cdo/apps/templates/teacherDashboard/shapes';
import {
  UnconnectedSyncOmniAuthSectionControl as SyncOmniAuthSectionControl,
  SyncOmniAuthSectionButton,
  READY, IN_PROGRESS, SUCCESS, FAILURE,
} from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';

describe('SyncOmniAuthSectionControl', () => {
  let importRoster, testSyncSucceeds, testSyncFails, defaultProps;

  beforeEach(() => {
    sinon.stub(SyncOmniAuthSectionControl, 'reloadPage');

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
    importRoster = sinon.stub().returns(promise);

    defaultProps = {
      sectionCode: 'G-123456',
      provider: OAuthSectionTypes.google_classroom,
      importRoster: importRoster,
    };
  });
  afterEach(() => {
    testSyncSucceeds && testSyncSucceeds();
    SyncOmniAuthSectionControl.reloadPage.restore();
  });

  it('initially renders in ready state', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps}/>);
    expect(wrapper).to.containMatchingElement(
      <SyncOmniAuthSectionButton
        provider={defaultProps.provider}
        buttonState={READY}
        onClick={wrapper.instance().onClick}
      />
    );
  });

  it('renders nothing if provider is not recognized', () => {
    // The usual case - null provider, for regular email or picture sections.
    const wrapper = shallow(
      <SyncOmniAuthSectionControl
        {...defaultProps}
        provider={null}
      />
    );
    expect(wrapper).to.be.blank();

    // Edge case - a provider name, but not one we currently support for imports.
    const wrapper2 = shallow(
      <SyncOmniAuthSectionControl
        {...defaultProps}
        provider={'microsoft_classroom'}
      />
    );
    expect(wrapper2).to.be.blank();
  });

  it('calls importRoster when clicked', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl{...defaultProps}/>);
    wrapper.simulate('click');
    expect(importRoster).to.have.been.calledOnce;
  });

  describe('strips the prefix from the sectionCode to generate the course ID', () => {
    it('G-', () => {
      const wrapper = shallow(
        <SyncOmniAuthSectionControl
          {...defaultProps}
          sectionCode="G-54321"
        />
      );
      wrapper.simulate('click');
      expect(importRoster).to.have.been.calledWith("54321");
    });

    it('C-', () => {
      const wrapper = shallow(
        <SyncOmniAuthSectionControl
          {...defaultProps}
          sectionCode="C-2468"
        />
      );
      wrapper.simulate('click');
      expect(importRoster).to.have.been.calledWith("2468");
    });
  });

  it('goes into an in-progress state when clicked', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps}/>);
    wrapper.simulate('click');
    expect(wrapper).to.containMatchingElement(
      <SyncOmniAuthSectionButton
        provider={defaultProps.provider}
        buttonState={IN_PROGRESS}
        onClick={wrapper.instance().onClick}
      />
    );
  });

  it('does not respond to clicks in the in-progress state', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps}/>);
    wrapper.simulate('click');
    expect(wrapper.find(SyncOmniAuthSectionButton))
      .to.have.prop('buttonState', IN_PROGRESS);

    wrapper.simulate('click');
    expect(wrapper.find(SyncOmniAuthSectionButton))
      .to.have.prop('buttonState', IN_PROGRESS);
  });

  it('goes into a success state when sync succeeds', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps}/>);
    wrapper.simulate('click');
    return expect(testSyncSucceeds()).to.be.fulfilled.then(() => {
      expect(wrapper).to.containMatchingElement(
        <SyncOmniAuthSectionButton
          provider={defaultProps.provider}
          buttonState={SUCCESS}
          onClick={wrapper.instance().onClick}
        />
      );
    });
  });

  it('reloads the page when sync succeeds', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps}/>);
    wrapper.simulate('click');
    return expect(testSyncSucceeds()).to.be.fulfilled.then(() => {
      expect(SyncOmniAuthSectionControl.reloadPage).to.have.been.calledOnce;
    });
  });

  it('does not respond to clicks in the success state', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps}/>);
    wrapper.simulate('click');
    return expect(testSyncSucceeds()).to.be.fulfilled.then(() => {
      expect(wrapper.find(SyncOmniAuthSectionButton))
        .to.have.prop('buttonState', SUCCESS);

      // Now that we're in a success state, test that we stay
      // in it on click!
      wrapper.simulate('click');
      expect(wrapper.find(SyncOmniAuthSectionButton))
        .to.have.prop('buttonState', SUCCESS);
    });
  });

  it('goes into a failure state when sync fails', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps}/>);
    wrapper.simulate('click');
    return expect(testSyncFails()).to.be.rejected.then(() => {
      expect(wrapper).to.containMatchingElement(
        <SyncOmniAuthSectionButton
          provider={defaultProps.provider}
          buttonState={FAILURE}
          onClick={wrapper.instance().onClick}
        />
      );
    });
  });

  it('returns to ready state when clicked in failure state', () => {
    const wrapper = shallow(<SyncOmniAuthSectionControl {...defaultProps}/>);
    wrapper.simulate('click');
    return expect(testSyncFails()).to.be.rejected.then(() => {
      expect(wrapper.find(SyncOmniAuthSectionButton))
        .to.have.prop('buttonState', FAILURE);

      // Now that we're in a failure state, test that we stay
      // in it on click!
      wrapper.simulate('click');
      expect(wrapper.find(SyncOmniAuthSectionButton))
        .to.have.prop('buttonState', READY);
    });
  });
});
