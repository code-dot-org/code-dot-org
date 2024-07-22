import {fireEvent, render, screen, within} from '@testing-library/react';
import $ from 'jquery';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import LtiSectionSyncDialog from '@cdo/apps/lib/ui/simpleSignUp/lti/sync/LtiSectionSyncDialog';
import {
  LtiSectionMap,
  LtiSectionSyncResult,
} from '@cdo/apps/lib/ui/simpleSignUp/lti/sync/types';
import i18n from '@cdo/locale';

import {expect} from '../../../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const MOCK_ALL_SECTION_MAP: LtiSectionMap = {
  1: {
    name: 'Section 1',
    short_name: 'Section 1',
    size: 100,
    lti_section_id: 1,
    instructors: [
      {
        name: 'Teacher 1',
        id: 0,
        isOwner: true,
      },
    ],
  },
  2: {
    name: 'Section 2',
    short_name: 'Section 2',
    size: 10,
    lti_section_id: 2,
    instructors: [
      {
        name: 'Teacher 1',
        id: 0,
        isOwner: true,
      },
      {
        name: 'Teacher 2',
        id: 0,
        isOwner: false,
      },
    ],
  },
};

const MOCK_UPDATED_SECTION_MAP: LtiSectionMap = {
  2: {
    name: 'Section 2: Code.org fundamentals',
    short_name: 'Section 2',
    size: 15,
    lti_section_id: 2,
    instructors: [
      {
        name: 'Teacher 1',
        id: 0,
        isOwner: true,
      },
    ],
  },
};

const MOCK_SYNC_RESULT: LtiSectionSyncResult = {
  all: MOCK_ALL_SECTION_MAP,
  changed: MOCK_UPDATED_SECTION_MAP,
};

const LMS_NAME = 'some_lms';

describe('LTI Section Sync Dialog', () => {
  beforeEach(() => {
    const jqueryStub = sinon.stub($, 'post');
    jqueryStub.yieldsTo('success');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Sync Result Sub View', () => {
    it('should show a sync results view', () => {
      render(
        <LtiSectionSyncDialog
          isOpen
          syncResult={MOCK_SYNC_RESULT}
          lmsName={LMS_NAME}
        />
      );

      screen.getByText(i18n.ltiSectionSyncDialogTitle());

      const list = screen.getByRole('grid');
      const {getAllByRole} = within(list);
      const items = getAllByRole('gridcell', {exact: false});
      const sectionListItems = items.map(item => item.textContent);
      const section = MOCK_UPDATED_SECTION_MAP[2];
      const instName = section.instructors[0].name;

      expect(sectionListItems[0]).to.match(
        new RegExp(
          `${section.short_name}${instName}${section.size}${section.instructors.length}`
        )
      );

      // no 'disable roster sync'
      expect(
        screen.queryByText(i18n.ltiSectionSyncDisableRosterSyncHeading())
      ).to.equal(null);
    });
  });

  describe('disable roster sync view', () => {
    it('should be able to disable roster sync', () => {
      const mockOnClose = sinon.stub();
      render(
        <LtiSectionSyncDialog
          isOpen
          syncResult={MOCK_SYNC_RESULT}
          disableRosterSyncButtonEnabled
          onClose={mockOnClose}
          lmsName={LMS_NAME}
        />
      );

      fireEvent.click(
        screen.getByText(i18n.ltiSectionSyncDisableRosterSyncButtonLabel())
      );

      // no section sync heading
      expect(screen.queryByText(i18n.ltiSectionSyncDialogTitle())).to.equal(
        null
      );

      // show disable roster sync modal
      screen.getByText(i18n.ltiSectionSyncDisableRosterSyncHeading());

      const continueButton = screen.getByText(i18n.continue());

      // click the 'continue' button which will post to the API end point
      fireEvent.click(continueButton);

      expect($.post).to.have.been.calledWith(
        sinon.match({
          url: '/api/v1/users/disable_lti_roster_sync',
          success: sinon.match.any,
        })
      );

      // returns to a spinner and calls onClose
      screen.getByText(i18n.loading());

      sinon.assert.called(mockOnClose);
    });

    it('should be able to return to sync status', () => {
      render(
        <LtiSectionSyncDialog
          isOpen
          syncResult={MOCK_SYNC_RESULT}
          disableRosterSyncButtonEnabled
          lmsName={LMS_NAME}
        />
      );

      fireEvent.click(
        screen.getByText(i18n.ltiSectionSyncDisableRosterSyncButtonLabel())
      );

      const cancelButton = within(
        screen.getByTestId('disable-roster-sync')
      ).getByText(i18n.dialogCancel());

      // click the 'continue' button which will post to the API end point
      fireEvent.click(cancelButton);

      expect($.post).not.to.have.been.calledWith(
        sinon.match({
          url: '/api/v1/users/disable_lti_roster_sync',
          success: sinon.match.any,
        })
      );

      // returns to sync status
      screen.getByText(i18n.ltiSectionSyncDialogTitle());
    });
  });

  describe('error view', () => {
    it('should render an error', () => {
      const errorSyncResult: LtiSectionSyncResult = {
        error: 'Error!!',
      };

      render(
        <LtiSectionSyncDialog
          isOpen
          syncResult={errorSyncResult}
          lmsName={LMS_NAME}
        />
      );

      screen.getByText(i18n.errorOccurredTitle());
      screen.getByText(i18n.ltiSectionSyncDialogError());
    });
  });
});
