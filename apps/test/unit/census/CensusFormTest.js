import '@testing-library/jest-dom';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {CensusForm} from '@cdo/apps/templates/census/CensusForm';
import i18n from '@cdo/locale';

const mockWindowLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockWindowLocation,
  writable: true,
});

function setup(jsx) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}
describe('CensusForm Component', () => {
  const defaultProps = {
    onSchoolDropdownChange: jest.fn(),
    schoolDropdownOption: undefined,
    initialSchoolYear: 2023,
    prefillData: {
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      isTeacher: true,
    },
  };
  let mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: Promise.resolve(),
    });
    window.fetch = mockFetch;
  });

  it('renders form with default values', () => {
    render(<CensusForm {...defaultProps} />);

    expect(screen.getByText(i18n.yourSchoolTellUs())).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(i18n.yourEmailPlaceholder())
    ).toHaveValue('john.doe@example.com');
    expect(screen.getByPlaceholderText(i18n.yourName())).toHaveValue(
      'John Doe'
    );
    expect(
      screen.getByPlaceholderText(i18n.yourEmailPlaceholder())
    ).toHaveValue('john.doe@example.com');
  });

  it('shows the census pledge when the role is teacher or administrator', async () => {
    const {user} = setup(
      <CensusForm
        {...{
          ...defaultProps,
          prefillData: {...defaultProps.prefillData, isTeacher: false},
        }}
      />
    );

    expect(
      screen.getByRole('combobox', {name: i18n.censusConnection() + ' *'})
    ).toHaveValue('');

    const roleDropdown = screen.getByRole('combobox', {
      name: i18n.censusConnection() + ' *',
    });

    await user.selectOptions(roleDropdown, 'TEACHER');
    expect(
      screen.getByRole('checkbox', {name: i18n.censusPledge()})
    ).toBeInTheDocument();
    await user.selectOptions(roleDropdown, '');
    expect(
      screen.queryByRole('checkbox', {name: i18n.censusPledge()})
    ).toBeNull();
    await user.selectOptions(roleDropdown, 'ADMINISTRATOR');
    expect(
      screen.getByRole('checkbox', {name: i18n.censusPledge()})
    ).toBeInTheDocument();
  });

  it('shows the census follow up section when the school offers at least 20 hours of cs', async () => {
    const {user} = setup(<CensusForm {...defaultProps} />);

    const followUpSection = () => screen.queryByText(i18n.censusFollowUp());

    expect(followUpSection()).not.toBeInTheDocument();

    const twentyHoursDropdown = screen.getByRole('combobox', {
      name: i18n.censusHowManyTwentyHours(),
    });

    await user.selectOptions(twentyHoursDropdown, 'SOME');

    expect(followUpSection()).toBeInTheDocument();
  });

  it('allows user to fill required fields', async () => {
    const {user} = setup(<CensusForm {...defaultProps} />);

    const emailInput = screen.getByPlaceholderText(i18n.yourEmailPlaceholder());
    const nameInput = screen.getByPlaceholderText(i18n.yourName());

    await user.clear(emailInput);
    await user.type(emailInput, 'new.email@example.com');

    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');

    expect(emailInput).toHaveValue('new.email@example.com');
    expect(nameInput).toHaveValue('Jane Doe');
  });

  it('validates required fields on submission', async () => {
    mockFetch.mockResolvedValueOnce({
      json: Promise.resolve([{value: '123', label: 'Cool School'}]),
    });

    const {user} = setup(
      <CensusForm
        {...{
          ...defaultProps,
          prefillData: {
            ...defaultProps.prefillData,
            userEmail: '',
            schoolId: '123',
          },
        }}
      />
    );

    // fetching school by schoolId
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    jest.clearAllMocks();

    const emailInput = screen.getByPlaceholderText(i18n.yourEmailPlaceholder());
    const hocInput = screen.getByRole('combobox', {
      name: i18n.censusHowManyHoC(),
    });
    const afterSchoolInput = screen.getByRole('combobox', {
      name: i18n.censusHowManyAfterSchool(),
    });
    const tenHoursInput = screen.getByRole('combobox', {
      name: i18n.censusHowManyTenHours(),
    });
    const twentyHoursInput = screen.getByRole('combobox', {
      name: i18n.censusHowManyTwentyHours(),
    });
    const shareInput = screen.getByRole('combobox', {
      name: /Share my contact information/,
    });
    const optInInput = screen.getByRole('combobox', {
      name: /Can we email you/,
    });
    const submitButton = screen.getByRole('button', {name: /submit/i});

    await user.click(submitButton);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(screen.getByText(i18n.censusRequiredEmail())).toBeInTheDocument();
    expect(screen.getByText(i18n.censusRequiredShare())).toBeInTheDocument();
    expect(
      screen.getByText(/required\. please let us know if we can email you\./i)
    ).toBeInTheDocument();
    expect(screen.queryAllByText(i18n.censusRequiredSelect())).toHaveLength(4);

    await user.type(emailInput, 'john@mail.com');
    await user.click(submitButton);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(
      screen.queryByText(i18n.censusRequiredEmail())
    ).not.toBeInTheDocument();

    await user.selectOptions(hocInput, 'SOME');
    await user.click(submitButton);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(screen.queryAllByText(i18n.censusRequiredSelect())).toHaveLength(3);

    await user.selectOptions(afterSchoolInput, 'SOME');
    await user.click(submitButton);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(screen.queryAllByText(i18n.censusRequiredSelect())).toHaveLength(2);

    await user.selectOptions(tenHoursInput, 'SOME');
    await user.click(submitButton);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(screen.queryAllByText(i18n.censusRequiredSelect())).toHaveLength(1);

    await user.selectOptions(twentyHoursInput, 'NONE');
    await user.click(submitButton);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(screen.queryAllByText(i18n.censusRequiredSelect())).toHaveLength(0);

    await user.selectOptions(shareInput, 'Yes');
    await user.click(submitButton);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(
      screen.queryByText(i18n.censusRequiredShare())
    ).not.toBeInTheDocument();

    await user.selectOptions(optInInput, 'Yes');
    await user.click(submitButton);

    expect(
      screen.queryByText(/required\. please let us know if we can email you\./i)
    ).not.toBeInTheDocument();

    expect(mockFetch).toHaveBeenCalled();
  });
});
