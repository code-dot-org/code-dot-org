import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {CLICK_TO_ADD, NO_SCHOOL_SETTING} from '@cdo/apps/schoolInfo/constants';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';
import i18n from '@cdo/locale';

describe('SchoolDataInputs', () => {
  const mockSetSchoolId = jest.fn();
  const mockSetCountry = jest.fn();
  const mockSetSchoolName = jest.fn();
  const mockSetSchoolZip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with initial props and default state', () => {
    render(
      <SchoolDataInputs
        schoolId="123"
        country="US"
        schoolName="School Name"
        schoolZip="12345"
        schoolsList={[{value: '1', text: 'School 1'}]}
        schoolZipIsValid={true}
        setSchoolId={mockSetSchoolId}
        setCountry={mockSetCountry}
        setSchoolName={mockSetSchoolName}
        setSchoolZip={mockSetSchoolZip}
      />
    );

    expect(screen.getByLabelText(i18n.whatCountry())).toBeInTheDocument();
    expect(screen.getByText(i18n.censusHeading())).toBeInTheDocument();
    expect(
      screen.getByText(i18n.schoolInfoInterstitialTitle())
    ).toBeInTheDocument();
    expect(screen.getByText(i18n.selectASchool())).toBeInTheDocument();
    expect(screen.getAllByText(i18n.noSchoolSetting())).toHaveLength(2);
  });

  it('should call setCountry when country dropdown changes', () => {
    render(
      <SchoolDataInputs
        schoolId="123"
        country="US"
        schoolName="School Name"
        schoolZip="12345"
        schoolsList={[{value: '1', text: 'School 1'}]}
        schoolZipIsValid={true}
        setSchoolId={mockSetSchoolId}
        setCountry={mockSetCountry}
        setSchoolName={mockSetSchoolName}
        setSchoolZip={mockSetSchoolZip}
      />
    );

    fireEvent.change(screen.getByLabelText(i18n.whatCountry()), {
      target: {value: 'CA'},
    });

    expect(mockSetCountry).toHaveBeenCalledWith('CA');
  });

  it('should render SchoolZipSearch when country is US', () => {
    render(
      <SchoolDataInputs
        schoolId="123"
        country="US"
        schoolName="School Name"
        schoolZip="12345"
        schoolsList={[{value: '1', text: 'School 1'}]}
        schoolZipIsValid={true}
        setSchoolId={mockSetSchoolId}
        setCountry={mockSetCountry}
        setSchoolName={mockSetSchoolName}
        setSchoolZip={mockSetSchoolZip}
      />
    );

    expect(
      screen.getByLabelText(i18n.enterYourSchoolZip())
    ).toBeInTheDocument();
  });

  it('should call setSchoolId when school dropdown changes', () => {
    render(
      <SchoolDataInputs
        schoolId="1"
        country="US"
        schoolName="School Name"
        schoolZip="12345"
        schoolsList={[
          {value: '1', text: 'School 1'},
          {value: '2', text: 'School 2'},
        ]}
        schoolZipIsValid={true}
        setSchoolId={mockSetSchoolId}
        setCountry={mockSetCountry}
        setSchoolName={mockSetSchoolName}
        setSchoolZip={mockSetSchoolZip}
      />
    );

    fireEvent.change(screen.getByLabelText(i18n.selectYourSchool()), {
      target: {value: '2'},
    });

    expect(mockSetSchoolId).toHaveBeenCalledWith('2');
  });

  it('should render SchoolNameInput and "Return to results" button when country is US and inputManually is true', () => {
    render(
      <SchoolDataInputs
        schoolId={CLICK_TO_ADD}
        country="US"
        schoolName="School Name"
        schoolZip="12345"
        schoolsList={[{value: '1', text: 'School 1'}]}
        schoolZipIsValid={true}
        setSchoolId={mockSetSchoolId}
        setCountry={mockSetCountry}
        setSchoolName={mockSetSchoolName}
        setSchoolZip={mockSetSchoolZip}
      />
    );

    expect(screen.getByDisplayValue('School Name')).toBeInTheDocument();
    expect(screen.getByText(i18n.returnToResults())).toBeInTheDocument();
  });

  it('should call handleSchoolChange when "No school setting" button is clicked', () => {
    render(
      <SchoolDataInputs
        schoolId="123"
        country="US"
        schoolName="School Name"
        schoolZip="12345"
        schoolsList={[{value: '1', text: 'School 1'}]}
        schoolZipIsValid={true}
        setSchoolId={mockSetSchoolId}
        setCountry={mockSetCountry}
        setSchoolName={mockSetSchoolName}
        setSchoolZip={mockSetSchoolZip}
      />
    );

    fireEvent.click(screen.getByRole('button', i18n.noSchoolSetting()));

    expect(mockSetSchoolId).toHaveBeenCalledWith(NO_SCHOOL_SETTING);
  });

  it('should not render SchoolZipSearch when country is not US', () => {
    render(
      <SchoolDataInputs
        schoolId="123"
        country="CA"
        schoolName="School Name"
        schoolZip="12345"
        schoolsList={[{value: '1', text: 'School 1'}]}
        schoolZipIsValid={true}
        setSchoolId={mockSetSchoolId}
        setCountry={mockSetCountry}
        setSchoolName={mockSetSchoolName}
        setSchoolZip={mockSetSchoolZip}
      />
    );

    expect(
      screen.queryByLabelText(i18n.enterYourSchoolZip())
    ).not.toBeInTheDocument();
  });
});
