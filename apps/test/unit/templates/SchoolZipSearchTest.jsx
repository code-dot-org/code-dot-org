import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import SchoolZipSearch from '@cdo/apps/templates/SchoolZipSearch';

// Mock i18n functions
jest.mock('@cdo/locale', () => ({
  enterYourSchoolZip: jest.fn(() => 'Enter your school zip'),
  zipInvalidMessage: jest.fn(() => 'Zip code is invalid'),
}));

describe('SchoolZipSearch', () => {
  const mockSetSchoolZip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with initial props', () => {
    render(
      <SchoolZipSearch
        fieldNames={{schoolZip: 'schoolZip'}}
        schoolZip="12345"
        setSchoolZip={mockSetSchoolZip}
        schoolZipIsValid={true}
      />
    );

    expect(screen.getByLabelText('Enter your school zip')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12345')).toBeInTheDocument();
  });

  it('should call setSchoolZip on zip code change', () => {
    render(
      <SchoolZipSearch
        fieldNames={{schoolZip: 'schoolZip'}}
        schoolZip=""
        setSchoolZip={mockSetSchoolZip}
        schoolZipIsValid={true}
      />
    );

    fireEvent.change(screen.getByLabelText('Enter your school zip'), {
      target: {value: '67890'},
    });

    expect(mockSetSchoolZip).toHaveBeenCalledWith('67890');
  });

  it('should display an error message when the zip code is invalid', () => {
    render(
      <SchoolZipSearch
        fieldNames={{schoolZip: 'schoolZip'}}
        schoolZip="12345"
        setSchoolZip={mockSetSchoolZip}
        schoolZipIsValid={false}
      />
    );

    expect(screen.getByText('Zip code is invalid')).toBeInTheDocument();
  });

  it('should not display an error message when the zip code is valid', () => {
    render(
      <SchoolZipSearch
        fieldNames={{schoolZip: 'schoolZip'}}
        schoolZip="12345"
        setSchoolZip={mockSetSchoolZip}
        schoolZipIsValid={true}
      />
    );

    expect(screen.queryByText('Zip code is invalid')).not.toBeInTheDocument();
  });
});
