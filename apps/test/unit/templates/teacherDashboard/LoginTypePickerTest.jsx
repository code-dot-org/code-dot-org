import {render, fireEvent, screen, within} from '@testing-library/react';
import React from 'react';

import {LmsLoginTypeNames} from '@cdo/apps/accounts/constants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import {UnconnectedLoginTypePicker as LoginTypePicker} from '@cdo/apps/templates/teacherDashboard/LoginTypePicker';
import experiments from '@cdo/apps/util/experiments';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

describe('LoginTypePicker', () => {
  const realIsEnabled = experiments.isEnabled;

  beforeEach(() => {
    stubRedux();
    registerReducers(commonReducers);
    registerReducers({currentUser});
    experiments.isEnabled = jest.fn(() => true);
  });

  afterEach(() => {
    restoreRedux();
    experiments.isEnabled = realIsEnabled;
  });

  it('sends analytic event when a login type is selected', () => {
    const {container} = render(
      <LoginTypePicker
        title="title"
        setLoginType={() => {}}
        handleCancel={() => {}}
        providers={[
          SectionLoginType.picture,
          SectionLoginType.word,
          SectionLoginType.email,
        ]}
      />
    );

    const realSendEvent = analyticsReporter.sendEvent;
    analyticsReporter.sendEvent = jest.fn();

    // eslint-disable-next-line no-restricted-properties
    const pictureLoginCard = container.querySelector('.uitest-pictureLogin');
    fireEvent.click(pictureLoginCard);

    expect(analyticsReporter.sendEvent).toHaveBeenCalledTimes(1);
    expect(analyticsReporter.sendEvent).toHaveBeenCalledWith(
      'Login Type Selected',
      {loginType: 'picture'}
    );

    analyticsReporter.sendEvent = realSendEvent;
  });

  it('shows all LMS informational cards for users without LMS logins', () => {
    render(
      <LoginTypePicker
        title="title"
        setLoginType={() => {}}
        handleCancel={() => {}}
        providers={[
          SectionLoginType.picture,
          SectionLoginType.word,
          SectionLoginType.email,
        ]}
      />
    );

    // eslint-disable-next-line no-restricted-properties
    const lmsCards = screen.getByTestId('lms-info-cards-container');
    expect(lmsCards.children).toHaveLength(5);
  });

  it('shows all cards for LTI users', () => {
    render(
      <LoginTypePicker
        title="title"
        setLoginType={() => {}}
        handleCancel={() => {}}
        providers={[
          SectionLoginType.picture,
          SectionLoginType.word,
          SectionLoginType.email,
          SectionLoginType.lti_v1,
        ]}
      />
    );

    // eslint-disable-next-line no-restricted-properties
    const lmsCards = screen.getByTestId('lms-info-cards-container');
    expect(lmsCards.children).toHaveLength(5);
  });

  it('does not show the Google LMS info card for Google users', () => {
    render(
      <LoginTypePicker
        title="title"
        setLoginType={() => {}}
        handleCancel={() => {}}
        providers={[
          SectionLoginType.picture,
          SectionLoginType.word,
          SectionLoginType.email,
          SectionLoginType.google_classroom,
        ]}
      />
    );

    // eslint-disable-next-line no-restricted-properties
    const lmsCards = screen.getByTestId('lms-info-cards-container');
    expect(lmsCards.children).toHaveLength(4);
    expect(
      within(lmsCards).queryByText(LmsLoginTypeNames.google_classroom)
    ).toBeNull();
  });

  it('does not show the Clever LMS info card for Clever users', () => {
    render(
      <LoginTypePicker
        title="title"
        setLoginType={() => {}}
        handleCancel={() => {}}
        providers={[
          SectionLoginType.picture,
          SectionLoginType.word,
          SectionLoginType.email,
          SectionLoginType.clever,
        ]}
      />
    );

    // eslint-disable-next-line no-restricted-properties
    const lmsCards = screen.getByTestId('lms-info-cards-container');
    expect(lmsCards.children).toHaveLength(4);
    expect(within(lmsCards).queryByText(LmsLoginTypeNames.clever)).toBeNull();
  });

  it('does not show the ClassLink LMS info card for ClassLink users', () => {
    render(
      <LoginTypePicker
        title="title"
        setLoginType={() => {}}
        handleCancel={() => {}}
        providers={[
          SectionLoginType.picture,
          SectionLoginType.word,
          SectionLoginType.email,
          SectionLoginType.classlink,
        ]}
      />
    );

    // eslint-disable-next-line no-restricted-properties
    const lmsCards = screen.getByTestId('lms-info-cards-container');
    expect(lmsCards.children).toHaveLength(4);
    expect(
      within(lmsCards).queryByText(LmsLoginTypeNames.classlink)
    ).toBeNull();
  });

  it('hides the LMS section for users holding every LMS provider', () => {
    render(
      <LoginTypePicker
        title="title"
        setLoginType={() => {}}
        handleCancel={() => {}}
        providers={[
          SectionLoginType.google_classroom,
          SectionLoginType.clever,
          SectionLoginType.classlink,
          SectionLoginType.lti_v1,
        ]}
      />
    );

    expect(
      screen.queryByRole('heading', {name: i18n.lmsIntegrations()})
    ).toBeNull();
  });
});
