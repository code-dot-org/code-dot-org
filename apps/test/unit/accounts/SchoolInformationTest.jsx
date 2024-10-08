import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import {SchoolInformation} from '@cdo/apps/accounts/SchoolInformation';
import {useSchoolInfo} from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import {schoolInfoInvalid} from '@cdo/apps/schoolInfo/utils/schoolInfoInvalid';
import {updateSchoolInfo} from '@cdo/apps/schoolInfo/utils/updateSchoolInfo';
import i18n from '@cdo/locale';

// Mock the hooks and utility functions
jest.mock('@cdo/apps/schoolInfo/hooks/useSchoolInfo');
jest.mock('@cdo/apps/schoolInfo/utils/updateSchoolInfo');
jest.mock('@cdo/apps/schoolInfo/utils/schoolInfoInvalid');

describe('SchoolInformation', () => {
  const defaultProps = {
    schoolInfo: {
      country: 'US',
      school_name: 'Test School',
      zip: '12345',
      school_id: '54321',
      school_type: undefined,
    },
  };

  const mockSchoolInfo = {
    schoolId: '54321',
    schoolName: 'Test School',
    country: 'US',
    schoolZip: '12345',
    schoolsList: [],
    setSchoolId: jest.fn(),
    setCountry: jest.fn(),
    setSchoolName: jest.fn(),
    setSchoolZip: jest.fn(),
  };

  beforeEach(() => {
    useSchoolInfo.mockReturnValue(mockSchoolInfo);
    schoolInfoInvalid.mockReturnValue(false);
    updateSchoolInfo.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component', () => {
    render(<SchoolInformation {...defaultProps} />);
    expect(
      screen.getByText(i18n.schoolInformationSchoolInformation())
    ).toBeInTheDocument();
  });

  it('renders the form fields and the button', () => {
    render(<SchoolInformation {...defaultProps} />);
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: i18n.schoolInformationUpdateSchoolInformation(),
      })
    ).toBeInTheDocument();
  });

  it('disables the save button if school info is invalid', () => {
    schoolInfoInvalid.mockReturnValue(true);
    render(<SchoolInformation {...defaultProps} />);
    expect(
      screen.getByRole('button', {
        name: i18n.schoolInformationUpdateSchoolInformation(),
      })
    ).toBeDisabled();
  });

  it('enables the save button if school info is valid', () => {
    render(<SchoolInformation {...defaultProps} />);
    expect(
      screen.getByRole('button', {
        name: i18n.schoolInformationUpdateSchoolInformation(),
      })
    ).toBeEnabled();
  });

  it('shows success alert when update is successful', async () => {
    render(<SchoolInformation {...defaultProps} />);
    fireEvent.click(
      screen.getByRole('button', {
        name: i18n.schoolInformationUpdateSchoolInformation(),
      })
    );

    await waitFor(() =>
      expect(
        screen.getByText(i18n.schoolInformationUpdateSuccess())
      ).toBeInTheDocument()
    );
    expect(
      screen.queryByText(i18n.schoolInformationUpdateFailure())
    ).not.toBeInTheDocument();
  });

  it('shows failure alert when update fails', async () => {
    updateSchoolInfo.mockRejectedValue(new Error('Update failed'));
    render(<SchoolInformation {...defaultProps} />);
    fireEvent.click(
      screen.getByRole('button', {
        name: i18n.schoolInformationUpdateSchoolInformation(),
      })
    );

    await waitFor(() =>
      expect(
        screen.getByText(i18n.schoolInformationUpdateFailure())
      ).toBeInTheDocument()
    );
    expect(
      screen.queryByText(i18n.schoolInformationUpdateSuccess())
    ).not.toBeInTheDocument();
  });

  it('resets alerts when school information changes', async () => {
    const {rerender} = render(<SchoolInformation {...defaultProps} />);
    fireEvent.click(
      screen.getByRole('button', {
        name: i18n.schoolInformationUpdateSchoolInformation(),
      })
    );

    // Simulate success alert
    await waitFor(() =>
      expect(
        screen.getByText(i18n.schoolInformationUpdateSuccess())
      ).toBeInTheDocument()
    );

    // Update school info to trigger useEffect
    useSchoolInfo.mockReturnValue({
      ...mockSchoolInfo,
      schoolName: 'New School',
    });

    rerender(<SchoolInformation {...defaultProps} />);

    expect(
      screen.queryByText(i18n.schoolInformationUpdateSuccess())
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(i18n.schoolInformationUpdateFailure())
    ).not.toBeInTheDocument();
  });

  it('calls updateSchoolInfo with correct parameters when the button is clicked', async () => {
    render(<SchoolInformation {...defaultProps} />);
    fireEvent.click(
      screen.getByRole('button', {
        name: i18n.schoolInformationUpdateSchoolInformation(),
      })
    );

    await waitFor(() => {
      expect(updateSchoolInfo).toHaveBeenCalledWith({
        schoolId: '54321',
        schoolName: 'Test School',
        schoolZip: '12345',
        country: 'US',
      });
    });
  });

  it('shows success alert when update is successful', async () => {
    render(<SchoolInformation {...defaultProps} />);
    fireEvent.click(
      screen.getByRole('button', {
        name: i18n.schoolInformationUpdateSchoolInformation(),
      })
    );

    // Wait for success alert to appear
    await waitFor(() => {
      expect(
        screen.getByText(i18n.schoolInformationUpdateSuccess())
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByText(i18n.schoolInformationUpdateFailure())
    ).not.toBeInTheDocument();
  });

  it('shows failure alert when update fails', async () => {
    updateSchoolInfo.mockRejectedValue(new Error('Update failed'));
    render(<SchoolInformation {...defaultProps} />);
    fireEvent.click(
      screen.getByRole('button', {
        name: i18n.schoolInformationUpdateSchoolInformation(),
      })
    );

    // Wait for failure alert to appear
    await waitFor(() => {
      expect(
        screen.getByText(i18n.schoolInformationUpdateFailure())
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByText(i18n.schoolInformationUpdateSuccess())
    ).not.toBeInTheDocument();
  });

  it('closes success alert when the close button is clicked', async () => {
    render(<SchoolInformation {...defaultProps} />);
    fireEvent.click(
      screen.getByRole('button', {
        name: i18n.schoolInformationUpdateSchoolInformation(),
      })
    );

    // Simulate success alert
    await waitFor(() =>
      expect(
        screen.getByText(i18n.schoolInformationUpdateSuccess())
      ).toBeInTheDocument()
    );

    // Close the success alert
    fireEvent.click(screen.getByRole('button', {name: /close/i}));
    expect(
      screen.queryByText(i18n.schoolInformationUpdateSuccess())
    ).not.toBeInTheDocument();
  });

  it('closes failure alert when the close button is clicked', async () => {
    updateSchoolInfo.mockRejectedValue(new Error('Update failed'));
    render(<SchoolInformation {...defaultProps} />);
    fireEvent.click(
      screen.getByRole('button', {
        name: i18n.schoolInformationUpdateSchoolInformation(),
      })
    );

    // Simulate success alert
    await waitFor(() =>
      expect(
        screen.getByText(i18n.schoolInformationUpdateFailure())
      ).toBeInTheDocument()
    );

    // Close the success alert
    fireEvent.click(screen.getByRole('button', {name: /close/i}));
    expect(
      screen.queryByText(i18n.schoolInformationUpdateFailure())
    ).not.toBeInTheDocument();
  });
});
