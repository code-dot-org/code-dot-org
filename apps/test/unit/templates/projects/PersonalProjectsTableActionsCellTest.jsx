import {render, screen} from '@testing-library/react';
import React from 'react';

import {PersonalProjectsTableActionsCell} from '@cdo/apps/templates/projects/PersonalProjectsTableActionsCell';
import i18n from '@cdo/locale';

describe('PersonalProjectsTableActionsCell', () => {
  it('shows ProjectNameFailureDialog when there is a projectNameFailure', () => {
    const profanity = 'farts';
    render(
      <PersonalProjectsTableActionsCell
        projectId="abcd4"
        projectType="applab"
        showDeleteDialog={() => {}}
        isEditing={true}
        isSaving={false}
        startRenamingProject={() => {}}
        updatedName={profanity}
        cancelRenamingProject={() => {}}
        saveProjectName={() => {}}
        remix={() => {}}
        projectNameFailure={profanity}
        unsetNameFailure={() => {}}
      />
    );
    screen.getByText(i18n.nameFailureDialogTitle());
  });

  it('does not show ProjectNameFailureDialog without projectNameFailure', () => {
    render(
      <PersonalProjectsTableActionsCell
        projectId="abcd4"
        projectType="applab"
        showDeleteDialog={() => {}}
        isEditing={false}
        isSaving={false}
        startRenamingProject={() => {}}
        updatedName="new name"
        cancelRenamingProject={() => {}}
        saveProjectName={() => {}}
        remix={() => {}}
        projectNameFailure={undefined}
        unsetNameFailure={() => {}}
      />
    );
    const projectNameFailureDialog = screen.queryByText(
      i18n.nameFailureDialogTitle()
    );
    expect(projectNameFailureDialog).toBeNull(); // it doesn't exist
  });
});
