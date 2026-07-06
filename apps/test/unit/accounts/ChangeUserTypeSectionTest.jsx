import {
  render,
  screen,
  fireEvent,
  getDefaultNormalizer,
} from '@testing-library/react';
import React from 'react';

import ChangeUserTypeSection from '@cdo/apps/accounts/ChangeUserTypeSection';
import i18n from '@cdo/locale';

describe('ChangeUserTypeSection', () => {
  const defaultProps = {
    initialUserType: 'student',
    userTypeOptions: [
      {value: 'student', text: 'Student'},
      {value: 'teacher', text: 'Teacher'},
    ],
    heading: 'Account Type',
    dropdownLabel: 'Are you a student or teacher?',
    buttonLabel: 'Update Account Type',
    onConfirm: () => {},
  };

  const renderSection = props =>
    render(<ChangeUserTypeSection {...defaultProps} {...props} />);
  const getButton = () =>
    screen.getByRole('button', {name: 'Update Account Type'});
  const getDropdown = () =>
    screen.getByRole('combobox', {name: 'Are you a student or teacher?'});

  it('renders the heading and a button disabled until the type changes', () => {
    renderSection();
    screen.getByRole('heading', {name: 'Account Type'});
    expect(getButton()).toBeDisabled();
  });

  it('enables the button once a different type is selected', () => {
    renderSection();
    fireEvent.change(getDropdown(), {target: {value: 'teacher'}});
    expect(getButton()).toBeEnabled();
  });

  it('calls onConfirm with the selected type', () => {
    const onConfirm = jest.fn();
    renderSection({onConfirm});
    fireEvent.change(getDropdown(), {target: {value: 'teacher'}});
    fireEvent.click(getButton());
    expect(onConfirm).toHaveBeenCalledWith('teacher');
  });

  it('shows a saving state while a returned promise is pending', async () => {
    const onConfirm = jest.fn(() => new Promise(() => {}));
    renderSection({onConfirm});
    fireEvent.change(getDropdown(), {target: {value: 'teacher'}});
    fireEvent.click(getButton());
    await screen.findByText(i18n.saving());
  });

  it('shows an error when the returned promise rejects', async () => {
    const onConfirm = jest.fn(() => Promise.reject(new Error('nope')));
    renderSection({onConfirm});
    fireEvent.change(getDropdown(), {target: {value: 'teacher'}});
    fireEvent.click(getButton());
    await screen.findByText(i18n.changeUserTypeModal_unexpectedError(), {
      normalizer: getDefaultNormalizer({collapseWhitespace: false}),
    });
  });
});
