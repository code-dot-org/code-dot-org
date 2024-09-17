import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';
import {NO_SCHOOL_SETTING} from '@cdo/apps/templates/SchoolZipSearch';
import i18n from '@cdo/locale';

describe('SchoolDataInputs', () => {
  function renderDefault(propOverrides = {}) {
    render(<SchoolDataInputs {...propOverrides} />);
  }

  it('displays headers in basic component render', () => {
    renderDefault();
    expect(screen.queryByText(i18n.censusHeading()));
  });

  it('does not display headers if includeHeaders prop is false', () => {
    renderDefault({includeHeaders: false});
    expect(screen.queryByText(i18n.censusHeading())).toBeFalsy();
  });

  it('does not display zip input until United States is selected as country', () => {
    renderDefault({usIp: false});
    expect(screen.queryByText(i18n.enterYourSchoolZip())).toBeFalsy();
    fireEvent.change(screen.getByRole('combobox')[0], {target: {value: 'US'}});
    expect(screen.queryByText(i18n.enterYourSchoolZip()));
  });

  it('does not ask for zip, asks instead for name if not US', () => {
    renderDefault();
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: {value: 'UK'},
    });
    expect(screen.queryByText(i18n.enterYourSchoolZip())).toBeFalsy();
    expect(screen.queryByText(i18n.schoolOrganizationQuestion()));
  });

  it('automatically displays Zip field if US IP address is detected', () => {
    renderDefault({usIp: true});
    expect(screen.queryByText(i18n.enterYourSchoolZip()));
  });

  it('does not show Name field if US IP address is detected', () => {
    renderDefault({usIp: true});
    expect(screen.queryByText(i18n.schoolOrganizationQuestion())).toBeFalsy();
  });

  it('does not show Name field if no IP address is detected', () => {
    renderDefault({usIp: undefined});
    expect(screen.queryByText(i18n.schoolOrganizationQuestion())).toBeFalsy();
  });

  it('automatically displays Name field if non-US IP address is detected', () => {
    renderDefault({usIp: false});
    expect(screen.queryByText(i18n.schoolOrganizationQuestion()));
  });

  it('autopopulates Name field if you leave and come back', () => {
    renderDefault({usIp: true});
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: {value: 'UK'},
    });
    fireEvent.change(screen.getByRole('textbox'), {
      target: {value: 'MySchoolAbroad'},
    });
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: {value: 'US'},
    });
    expect(screen.queryByText('MySchoolAbroad')).toBeFalsy();
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: {value: 'UK'},
    });
    expect(screen.queryByText('MySchoolAbroad'));
  });

  it('autopopulates Zip and ID fields if you leave and come back', () => {
    renderDefault({usIp: true});
    fireEvent.change(screen.getByRole('textbox'), {target: {value: '98112'}});
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: {value: NO_SCHOOL_SETTING},
    });
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: {value: 'UK'},
    });
    expect(screen.queryByText('98112')).toBeFalsy();
    expect(screen.queryByText(NO_SCHOOL_SETTING)).toBeFalsy();
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: {value: 'US'},
    });
    expect(screen.queryByText('98112'));
    expect(screen.queryByText(NO_SCHOOL_SETTING));
  });

  it('displays error message if the zip is too short', () => {
    renderDefault({usIp: true});
    fireEvent.change(screen.getByRole('textbox'), {target: {value: '99'}});
    expect(screen.queryByText(i18n.zipInvalidMessage()));
  });

  it('displays school dropdown if zip is given', () => {
    renderDefault({usIp: true});
    fireEvent.change(screen.getByRole('textbox'), {target: {value: '98112'}});
    expect(screen.queryByText(i18n.selectYourSchool()));
  });

  it('dropdown switches to input box if user clicks to add', () => {
    renderDefault();
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: {value: 'US'},
    });
    fireEvent.change(screen.getByRole('textbox'), {target: {value: '98112'}});
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: {value: 'clickToAdd'},
    });
    expect(screen.queryByText(i18n.schoolOrganizationQuestion()));
  });

  it('goes back to dropdown if user clicks return to results list', () => {
    renderDefault();
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: {value: 'US'},
    });
    fireEvent.change(screen.getByRole('textbox'), {target: {value: '98112'}});
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: {value: 'clickToAdd'},
    });
    expect(screen.queryByText(i18n.schoolOrganizationQuestion()));
    fireEvent.click(screen.getByRole('button', {name: i18n.returnToResults()}));
    expect(screen.queryByText(i18n.selectYourSchool()));
  });
});
