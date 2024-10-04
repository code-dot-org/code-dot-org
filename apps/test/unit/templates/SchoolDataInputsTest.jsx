import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';

import {
  CLICK_TO_ADD,
  SELECT_A_SCHOOL,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';
import i18n from '@cdo/locale';

describe('SchoolDataInputs', () => {
  const mockSetSchoolId = jest.fn();
  const mockSetCountry = jest.fn();
  const mockSetSchoolName = jest.fn();
  const mockSetSchoolZip = jest.fn();

  const defaultProps = {
    schoolId: '',
    country: '',
    schoolName: '',
    schoolZip: '',
    schoolsList: [],
    setSchoolId: mockSetSchoolId,
    setCountry: mockSetCountry,
    setSchoolName: mockSetSchoolName,
    setSchoolZip: mockSetSchoolZip,
  };

  function renderDefault(propOverrides = {}) {
    render(<SchoolDataInputs {...defaultProps} {...propOverrides} />);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('displays headers in basic component render', () => {
    renderDefault();
    expect(screen.getByText(i18n.censusHeading())).toBeInTheDocument();
  });

  it('does not display headers if includeHeaders prop is false', () => {
    renderDefault({includeHeaders: false});
    expect(screen.queryByText(i18n.censusHeading())).toBeNull();
  });

  it('does not display zip input until United States is selected as country', () => {
    renderDefault({usIp: false});
    expect(screen.queryByText(i18n.enterYourSchoolZip())).toBeNull();
  });

  it('does not ask for zip, asks instead for name if not US', () => {
    renderDefault({country: 'UK'});
    expect(screen.queryByText(i18n.enterYourSchoolZip())).toBeNull();
    expect(
      screen.getByText(i18n.schoolOrganizationQuestion())
    ).toBeInTheDocument();
  });

  it('automatically displays Zip field if US country is selected', () => {
    renderDefault({usIp: true, country: 'US'});
    expect(screen.getByText(i18n.enterYourSchoolZip())).toBeInTheDocument();
  });

  it('does not show Name field if US country is detected', () => {
    renderDefault({usIp: true, country: 'US'});
    expect(screen.queryByText(i18n.schoolOrganizationQuestion())).toBeNull();
  });

  it('does not show Name field if country is not selected', () => {
    renderDefault({usIp: undefined});
    expect(screen.queryByText(i18n.schoolOrganizationQuestion())).toBeNull();
  });

  it('automatically displays Name field if non-US country is detected', () => {
    renderDefault({country: 'UK'});
    expect(
      screen.getByText(i18n.schoolOrganizationQuestion())
    ).toBeInTheDocument();
  });

  it('displays error message if the zip is too short', () => {
    renderDefault({country: 'US', schoolZip: '99'});
    expect(screen.getByText(i18n.zipInvalidMessage())).toBeInTheDocument();
  });

  it('displays and enables school dropdown if a valid zip is given', () => {
    renderDefault({country: 'US', schoolZip: '98112'});
    const dropDown = screen.getByLabelText(i18n.selectYourSchool());
    expect(dropDown).toBeEnabled();
  });

  it('disables school dropdown if zip is invalid', () => {
    renderDefault({country: 'US', schoolZip: '99'});
    const dropDown = screen.getByLabelText(i18n.selectYourSchool());
    expect(dropDown).toBeDisabled();
  });

  it('dropdown switches to input box if user clicks to add', () => {
    renderDefault({country: 'US', schoolId: CLICK_TO_ADD});
    expect(
      screen.getByText(i18n.schoolOrganizationQuestion())
    ).toBeInTheDocument();
  });

  it('goes back to dropdown if user clicks return to results list', () => {
    renderDefault({
      country: 'US',
      schoolId: SELECT_A_SCHOOL,
    });
    expect(screen.getByText(i18n.selectYourSchool())).toBeInTheDocument();
  });
});
