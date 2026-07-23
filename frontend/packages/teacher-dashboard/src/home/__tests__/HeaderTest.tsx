import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import DCDO from '@cdo/apps/dcdo';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import {Header} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/Header';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import experiments from '@cdo/apps/util/experiments';

// These dialogs connect to redux and fire their own effects; the Header tests
// only care about the header's controls, so render them as no-ops.
jest.mock(
  '@cdo/apps/templates/teacherDashboard/AddSectionDialog',
  () => () => null,
);
jest.mock(
  '@cdo/apps/templates/teacherDashboard/RosterDialog',
  () => () => null,
);

describe('Header', () => {
  let realIsEnabled: typeof experiments.isEnabled;

  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections, currentUser});
    realIsEnabled = experiments.isEnabled;
    // The resume-onboarding control is gated on the onboarding experiment OR
    // the onboarding-enabled DCDO flag. Default to "on" via the experiment;
    // individual tests override as needed. Keep DCDO off so the experiment is
    // the only signal under test.
    experiments.isEnabled = jest.fn(
      (key: string) => key === experiments.ONBOARDING,
    );
    jest
      .spyOn(DCDO, 'get')
      .mockImplementation((_key, fallback = false) => fallback);
  });

  afterEach(() => {
    experiments.isEnabled = realIsEnabled;
    restoreRedux();
    jest.restoreAllMocks();
  });

  function renderComponent(
    overrides: Partial<React.ComponentProps<typeof Header>> = {},
  ) {
    const props = {
      selectedArchiveToggle: 'teaching' as const,
      setSelectedArchiveToggle: jest.fn(),
      onResumeOnboarding: jest.fn(),
      onboardingHidden: false,
      ...overrides,
    };
    return {
      props,
      ...render(
        <Provider store={getStore()}>
          <Header {...props} />
        </Provider>,
      ),
    };
  }

  it('hides the resume-onboarding option when onboarding is not hidden', () => {
    renderComponent({onboardingHidden: false});

    expect(screen.queryByText('Resume onboarding')).toBeNull();
  });

  it('shows the resume-onboarding option when onboarding is hidden', () => {
    renderComponent({onboardingHidden: true});

    expect(screen.queryByText('Resume onboarding')).not.toBeNull();
  });

  it('does not show the resume-onboarding option when onboarding is disabled', () => {
    // Experiment off (and DCDO off from beforeEach) => onboarding disabled.
    experiments.isEnabled = jest.fn(() => false);
    renderComponent({onboardingHidden: true});

    expect(screen.queryByText('Resume onboarding')).toBeNull();
  });

  it('shows the resume-onboarding option when enabled via the DCDO flag', () => {
    // Experiment off, but the onboarding-enabled DCDO flag is on.
    experiments.isEnabled = jest.fn(() => false);
    (DCDO.get as jest.Mock).mockImplementation(
      (key: string) => key === 'onboarding-enabled',
    );
    renderComponent({onboardingHidden: true});

    expect(screen.queryByText('Resume onboarding')).not.toBeNull();
  });

  it('calls onResumeOnboarding when the option is clicked', () => {
    const {props} = renderComponent({onboardingHidden: true});

    fireEvent.click(screen.getByText('Resume onboarding'));

    expect(props.onResumeOnboarding).toHaveBeenCalledTimes(1);
  });
});
