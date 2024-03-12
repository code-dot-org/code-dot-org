import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {expect} from '../../util/deprecatedChai';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';
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
});
