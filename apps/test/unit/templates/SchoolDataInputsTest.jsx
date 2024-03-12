import React from 'react';
import {render, screen} from '@testing-library/react';
import {expect} from '../../util/deprecatedChai';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';
import i18n from '@cdo/locale';

describe('SchoolDataInputs', () => {
  function renderDefault() {
    render(<SchoolDataInputs />);
  }
  it('shallow-renders', () => {
    renderDefault({signedIn: true});
    expect(screen.queryByText(i18n.censusHeading()));
  });
});
