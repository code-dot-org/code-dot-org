import LtiSectionSyncDialog from '@cdo/apps/lib/ui/lti/sync/LtiSectionSyncDialog';
import {fireEvent, render, screen, within} from '@testing-library/react';
import {
  LtiSectionMap,
  LtiSectionSyncResult,
} from '@cdo/apps/lib/ui/lti/sync/types';
import React from 'react';
import {expect} from '../../../../../util/reconfiguredChai';
import i18n from '@cdo/locale';
import $ from 'jquery';
import sinon from 'sinon';

const MOCK_ALL_SECTION_MAP: LtiSectionMap = {
  1: {
    name: 'Section 1',
    size: 100,
  },
  2: {
    name: 'Section 2',
    size: 10,
  },
};

const MOCK_UPDATED_SECTION_MAP: LtiSectionMap = {
  2: {
    name: 'Section 2: Code.org fundamentals',
    size: 15,
  },
};

const MOCK_SYNC_RESULT: LtiSectionSyncResult = {
  all: MOCK_ALL_SECTION_MAP,
  updated: MOCK_UPDATED_SECTION_MAP,
};

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
      render(<LtiSectionSyncDialog isOpen syncResult={MOCK_SYNC_RESULT} />);

      screen.getByText(i18n.ltiSectionSyncDialogTitle());

      const list = screen.getByRole('list');
      const {getAllByRole} = within(list);
      const items = getAllByRole('listitem', {exact: false});
      const sectionListItems = items.map(item => item.textContent);

      expect(sectionListItems[0]).to.match(/Section 1(.*)100 students/);
      expect(sectionListItems[1]).to.match(/Section 2 (.*) 10 students/);

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

      render(<LtiSectionSyncDialog isOpen syncResult={errorSyncResult} />);

      screen.getByText(i18n.errorOccurredTitle());
      screen.getByText(i18n.ltiSectionSyncDialogError());
    });
  });
});
