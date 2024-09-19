import {render, screen} from '@testing-library/react';
import React from 'react';

import NoUnitAssignedView from '@cdo/apps/templates/teacherNavigation/NoUnitAssignedView';
import i18n from '@cdo/locale';

describe('NoUnitAssignedView', () => {
  it('renders the component with image, button, and text', () => {
    render(<NoUnitAssignedView courseName="CSD" />);

    screen.getByAltText(i18n.almostThere());
    screen.getByText(i18n.almostThere());
    screen.getByText(i18n.noUnitAssigned({courseName: 'CSD'}));
    screen.getByRole('button', {name: i18n.assignAUnit()});
  });
});
