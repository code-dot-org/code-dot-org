import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import ResetProgressDialog from '@cdo/apps/templates/sectionProgressV2/ResetProgressDialog';
import * as sectionProgressLoader from '@cdo/apps/templates/sectionProgressV2/sectionProgressLoader';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';

jest.mock('@cdo/apps/templates/sectionProgressV2/sectionProgressLoader');
jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  AUTHENTICITY_TOKEN_HEADER: 'X-CSRF-TOKEN',
  getAuthenticityToken: jest.fn(),
}));

describe('ResetProgressDialog', () => {
  const students = [
    {id: 1, name: 'Student1', familyName: 'Familyone'},
    {id: 2, name: 'Student2', familyName: 'Familytwo'},
  ];
  let onClose;
  let sendEvent;

  beforeEach(() => {
    onClose = jest.fn();
    getAuthenticityToken.mockResolvedValue('a-token');
    sendEvent = jest
      .spyOn(analyticsReporter, 'sendEvent')
      .mockImplementation(() => {});
    jest.spyOn(experiments, 'isEnabled').mockReturnValue(false);
    localStorage.clear();
    jest.spyOn(sectionProgressLoader, 'loadUnitProgress').mockReturnValue();
    global.fetch = jest.fn().mockResolvedValue({ok: true});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const renderComponent = (props = {}) =>
    render(
      <ResetProgressDialog
        students={students}
        unitId={99}
        unitName="Course A"
        sectionId={5}
        courseId={7}
        unitPosition={2}
        onClose={onClose}
        {...props}
      />
    );

  it('names the unit in both steps', () => {
    renderComponent();

    expect(
      screen.getByText(
        i18n.resetProgressSelectStudentsDescriptionForUnit({
          unitName: 'Course A',
        })
      )
    ).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));

    expect(
      screen.getByText(
        i18n.resetProgressConfirmWarningForUnit({unitName: 'Course A'})
      )
    ).toBeTruthy();
  });

  it('falls back to unnamed wording when the unit name is unavailable', () => {
    renderComponent({unitName: undefined});

    expect(
      screen.getByText(i18n.resetProgressSelectStudentsDescription())
    ).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));

    expect(screen.getByText(i18n.resetProgressConfirmWarning())).toBeTruthy();
  });

  it('renders a checkbox for every student and disables Next until one is selected', () => {
    renderComponent();

    expect(screen.getByText('Student1 Familyone')).toBeTruthy();
    expect(screen.getByText('Student2 Familytwo')).toBeTruthy();
    expect(screen.getByRole('button', {name: i18n.next()})).toBeDisabled();
  });

  it('select-all checks every student and shows indeterminate when partially selected', () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    const selectAll = screen.getByLabelText(i18n.selectAll());
    expect(selectAll.indeterminate).toBe(true);

    fireEvent.click(selectAll);
    expect(screen.getByLabelText('Student1 Familyone').checked).toBe(true);
    expect(screen.getByLabelText('Student2 Familytwo').checked).toBe(true);

    fireEvent.click(selectAll);
    expect(screen.getByLabelText('Student1 Familyone').checked).toBe(false);
    expect(screen.getByLabelText('Student2 Familytwo').checked).toBe(false);
  });

  it('cancel on the select step closes without calling the API', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', {name: i18n.dialogCancel()}));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('advances to the confirm step and warns before resetting', () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));

    expect(screen.getByText(i18n.resetProgressConfirmTitle())).toBeTruthy();
    expect(
      screen.getByText(
        i18n.resetProgressConfirmWarningForUnit({unitName: 'Course A'})
      )
    ).toBeTruthy();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('cancel on the confirm step closes without calling the API', () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    fireEvent.click(screen.getByRole('button', {name: i18n.dialogCancel()}));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('confirming calls the API with the selected students and current unit, then refreshes and closes', async () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    fireEvent.click(screen.getByLabelText('Student2 Familytwo'));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    fireEvent.click(screen.getByRole('button', {name: i18n.resetProgress()}));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/mass_progress_reset',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({'X-CSRF-TOKEN': 'a-token'}),
        body: JSON.stringify({unit_ids: [99], student_ids: [1, 2]}),
      })
    );
    expect(sectionProgressLoader.loadUnitProgress).toHaveBeenCalledWith(
      99,
      5,
      7,
      2
    );
  });

  it('reports the submission and the success', async () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    fireEvent.click(screen.getByRole('button', {name: i18n.resetProgress()}));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));

    const expectedData = {
      sectionId: 5,
      unitId: 99,
      studentCount: 1,
      sectionStudentCount: 2,
      allStudentsSelected: false,
    };
    expect(sendEvent).toHaveBeenCalledWith(
      EVENTS.PROGRESS_V2_RESET_PROGRESS_SUBMITTED,
      expectedData
    );
    expect(sendEvent).toHaveBeenCalledWith(
      EVENTS.PROGRESS_V2_RESET_PROGRESS,
      expectedData
    );
    expect(sendEvent).not.toHaveBeenCalledWith(
      EVENTS.PROGRESS_V2_RESET_PROGRESS_FAILED,
      expect.anything()
    );
  });

  it('records that every student was selected', async () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText(i18n.selectAll()));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    fireEvent.click(screen.getByRole('button', {name: i18n.resetProgress()}));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));

    expect(sendEvent).toHaveBeenCalledWith(
      EVENTS.PROGRESS_V2_RESET_PROGRESS_SUBMITTED,
      expect.objectContaining({studentCount: 2, allStudentsSelected: true})
    );
  });

  it('reports a failure instead of a success when the API call fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ok: false, status: 500});
    renderComponent();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    fireEvent.click(screen.getByRole('button', {name: i18n.resetProgress()}));

    await waitFor(() =>
      expect(sendEvent).toHaveBeenCalledWith(
        EVENTS.PROGRESS_V2_RESET_PROGRESS_FAILED,
        expect.objectContaining({
          sectionId: 5,
          unitId: 99,
          error: 'mass_progress_reset failed: 500',
        })
      )
    );

    expect(sendEvent).toHaveBeenCalledWith(
      EVENTS.PROGRESS_V2_RESET_PROGRESS_SUBMITTED,
      expect.anything()
    );
    expect(sendEvent).not.toHaveBeenCalledWith(
      EVENTS.PROGRESS_V2_RESET_PROGRESS,
      expect.anything()
    );
  });

  describe('with the reset-progress-reason experiment on', () => {
    const REASON_STORAGE_KEY = 'reset-progress-reason';
    // DSCO nests the input inside its <label>, and the helper message sits in
    // that label too, so the accessible name is more than the label text.
    const reasonField = () =>
      screen.getByLabelText(new RegExp(i18n.resetProgressReasonLabel()));

    beforeEach(() => {
      experiments.isEnabled.mockImplementation(
        key => key === experiments.RESET_PROGRESS_REASON
      );
    });

    const advanceToConfirm = () => {
      renderComponent();
      fireEvent.click(screen.getByLabelText('Student1 Familyone'));
      fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    };

    it('blocks the reset until a reason is given', () => {
      advanceToConfirm();

      const resetButton = screen.getByRole('button', {
        name: i18n.resetProgress(),
      });
      expect(resetButton).toBeDisabled();

      fireEvent.change(reasonField(), {
        target: {value: 'Students restarted the unit'},
      });

      expect(resetButton).not.toBeDisabled();
    });

    it('treats whitespace as no reason at all', () => {
      advanceToConfirm();

      fireEvent.change(reasonField(), {
        target: {value: '   '},
      });

      expect(
        screen.getByRole('button', {name: i18n.resetProgress()})
      ).toBeDisabled();
    });

    it('sends the reason on the submitted event and remembers it', async () => {
      advanceToConfirm();

      fireEvent.change(reasonField(), {
        target: {value: '  Students restarted the unit  '},
      });
      fireEvent.click(screen.getByRole('button', {name: i18n.resetProgress()}));

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));

      expect(sendEvent).toHaveBeenCalledWith(
        EVENTS.PROGRESS_V2_RESET_PROGRESS_SUBMITTED,
        expect.objectContaining({resetReason: 'Students restarted the unit'})
      );
      expect(localStorage.getItem(REASON_STORAGE_KEY)).toBe(
        'Students restarted the unit'
      );
    });

    it('auto-populates the field from the previous reset', () => {
      localStorage.setItem(REASON_STORAGE_KEY, 'End of semester');

      advanceToConfirm();

      expect(reasonField().value).toBe('End of semester');
    });
  });

  it('does not ask for a reason when the experiment is off', () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));

    expect(screen.queryByLabelText(i18n.resetProgressReasonLabel())).toBeNull();
    expect(
      screen.getByRole('button', {name: i18n.resetProgress()})
    ).not.toBeDisabled();
  });

  it('shows an error and keeps the dialog open when the API call fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ok: false, status: 500});
    renderComponent();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    fireEvent.click(screen.getByRole('button', {name: i18n.resetProgress()}));

    await waitFor(() =>
      expect(screen.getByText(i18n.formServerError())).toBeTruthy()
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(sectionProgressLoader.loadUnitProgress).not.toHaveBeenCalled();
  });
});
