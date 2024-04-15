import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';
import i18n from '@cdo/locale';

import {expect} from '../../util/deprecatedChai';

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
    expect(screen.queryByText(i18n.censusHeading())).to.not.exist;
  });

  it('does not display zip input until United States is selected as country', () => {
    renderDefault();
    expect(screen.queryByText(i18n.enterYourSchoolZip())).to.not.exist;
    fireEvent.change(screen.getByRole('combobox'), {target: {value: 'US'}});
    expect(screen.queryByText(i18n.enterYourSchoolZip()));
  });

  it('does not ask for zip, asks instead for name if not US', () => {
    renderDefault();
    fireEvent.change(screen.getByRole('combobox'), {target: {value: 'UK'}});
    expect(screen.queryByText(i18n.enterYourSchoolZip())).to.not.exist;
    expect(screen.queryByText(i18n.schoolOrganizationQuestion()));
  });

  it('displays error message if the zip is too short', () => {
    renderDefault();
    fireEvent.change(screen.getByRole('combobox'), {target: {value: 'US'}});
    fireEvent.change(screen.getByRole('textbox'), {target: {value: '99'}});
    expect(screen.queryByText(i18n.zipInvalidMessage()));
  });

  it('displays school dropdown if zip is given', () => {
    renderDefault();
    fireEvent.change(screen.getByRole('combobox'), {target: {value: 'US'}});
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
