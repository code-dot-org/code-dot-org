import {render, screen} from '@testing-library/react';
import React from 'react';

import ProjectNameFailureDialog from '@cdo/apps/templates/projects/ProjectNameFailureDialog';
import i18n from '@cdo/locale';

describe('ProjectNameFailureDialog', () => {
  const naughtyWord = 'farts';
  it('renders with flagged text', () => {
    render(
      <ProjectNameFailureDialog
        flaggedText={naughtyWord}
        isOpen={true}
        handleClose={() => {}}
      />
    );
    screen.getByText(i18n.nameFailureDialogTitle());
    screen.getByText(/farts/);
  });
});
