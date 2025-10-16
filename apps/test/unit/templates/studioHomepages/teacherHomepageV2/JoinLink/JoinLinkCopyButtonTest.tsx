import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import firehoseClient from '@cdo/apps/metrics/firehose';
import JoinLinkCopyButton from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/JoinLink/JoinLinkCopyButton';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

jest.mock('@cdo/apps/metrics/firehose');
jest.mock('@cdo/apps/metrics/AnalyticsReporter');
jest.mock('@cdo/apps/util/copyToClipboard');

describe('JoinLinkCopyButton', () => {
  const mockProps = {
    sectionCode: 'ABC123',
    sectionId: 123,
    studioUrlPrefix: 'https://studio.code.org',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section code', () => {
    render(
      <JoinLinkCopyButton {...mockProps} loginType={SectionLoginType.email} />
    );

    screen.getByText('ABC123');
    screen.getByText(i18n.sectionCodeWithColon());
  });

  it('renders "not applicable" for Google Classroom login type', () => {
    render(
      <JoinLinkCopyButton
        {...mockProps}
        loginType={SectionLoginType.google_classroom}
      />
    );

    screen.getByText(`${i18n.sectionCodeWithColon()} ${i18n.notApplicable()}`);
    screen.getByRole('button', {name: 'Why?'});
  });

  it('renders "not applicable" for Clever login type', () => {
    render(
      <JoinLinkCopyButton {...mockProps} loginType={SectionLoginType.clever} />
    );

    screen.getByText(`${i18n.sectionCodeWithColon()} ${i18n.notApplicable()}`);
    screen.getByRole('button', {name: 'Why?'});
  });

  it('copies section code link to clipboard when clicked', () => {
    render(
      <JoinLinkCopyButton {...mockProps} loginType={SectionLoginType.email} />
    );

    fireEvent.click(screen.getByText('ABC123'));

    expect(copyToClipboard).toHaveBeenCalledWith(
      'https://studio.code.org/join/ABC123'
    );
    expect(firehoseClient.putRecord).toHaveBeenCalledWith(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'copy-section-code-join-link',
        data_json: JSON.stringify({
          sectionId: 123,
        }),
      },
      {includeUserId: true}
    );
    expect(analyticsReporter.sendEvent).toHaveBeenCalledWith(
      EVENTS.SECTION_CARD_CLASS_CODE_CLICKED,
      {source: 'teacherHomepage'},
      PLATFORMS.BOTH
    );

    screen.getByText(i18n.copySectionCodeSuccess());
  });

  it('shows dialog when clicking question mark for non-applicable section codes', () => {
    render(
      <JoinLinkCopyButton
        {...mockProps}
        loginType={SectionLoginType.google_classroom}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    screen.getByText(
      i18n.noSectionDialogHeader({classroom: i18n.loginTypeGoogleClassroom()})
    );
    screen.getByText(
      i18n.noSectionDialogBody({classroom: i18n.loginTypeGoogleClassroom()})
    );
  });

  it('closes dialog when clicking OK button', () => {
    render(
      <JoinLinkCopyButton
        {...mockProps}
        loginType={SectionLoginType.google_classroom}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(i18n.ok()));

    expect(
      screen.queryByText(
        i18n.noSectionDialogHeader({classroom: i18n.loginTypeGoogleClassroom()})
      )
    ).toBeNull();
  });

  it('removes success message after timeout', () => {
    jest.useFakeTimers();

    render(
      <JoinLinkCopyButton {...mockProps} loginType={SectionLoginType.email} />
    );

    fireEvent.click(screen.getByText('ABC123'));
    screen.getByText(i18n.copySectionCodeSuccess());

    jest.advanceTimersByTime(5000);

    expect(screen.queryByText(i18n.copySectionCodeSuccess())).toBeNull();
    screen.getByText('ABC123');

    jest.useRealTimers();
  });
});
