import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import * as sectionProgressLoader from '@cdo/apps/templates/sectionProgressV2/sectionProgressLoader';
import ResetProgressDialog from '@cdo/apps/templates/sectionProgressV2/ResetProgressDialog';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
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

  beforeEach(() => {
    onClose = jest.fn();
    getAuthenticityToken.mockResolvedValue('a-token');
    jest.spyOn(sectionProgressLoader, 'loadUnitProgress').mockReturnValue();
    global.fetch = jest.fn().mockResolvedValue({ok: true});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const renderComponent = () =>
    render(
      <ResetProgressDialog
        students={students}
        unitId={99}
        sectionId={5}
        courseId={7}
        unitPosition={2}
        onClose={onClose}
      />
    );

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

    fireEvent.click(
      screen.getByRole('button', {name: i18n.dialogCancel()})
    );

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('advances to the confirm step and warns before resetting', () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));

    expect(screen.getByText(i18n.resetProgressConfirmTitle())).toBeTruthy();
    expect(screen.getByText(i18n.resetProgressConfirmWarning())).toBeTruthy();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('cancel on the confirm step closes without calling the API', () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    fireEvent.click(
      screen.getByRole('button', {name: i18n.dialogCancel()})
    );

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('confirming calls the API with the selected students and current unit, then refreshes and closes', async () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    fireEvent.click(screen.getByLabelText('Student2 Familytwo'));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    fireEvent.click(
      screen.getByRole('button', {name: i18n.resetProgress()})
    );

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));

    expect(global.fetch).toHaveBeenCalledWith(
      '/dashboardapi/mass_progress_reset',
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

  it('shows an error and keeps the dialog open when the API call fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ok: false, status: 500});
    renderComponent();

    fireEvent.click(screen.getByLabelText('Student1 Familyone'));
    fireEvent.click(screen.getByRole('button', {name: i18n.next()}));
    fireEvent.click(
      screen.getByRole('button', {name: i18n.resetProgress()})
    );

    await waitFor(() =>
      expect(screen.getByText(i18n.formServerError())).toBeTruthy()
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(sectionProgressLoader.loadUnitProgress).not.toHaveBeenCalled();
  });
});
