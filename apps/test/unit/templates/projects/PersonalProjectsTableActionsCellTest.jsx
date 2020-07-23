import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {PersonalProjectsTableActionsCell} from '@cdo/apps/templates/projects/PersonalProjectsTableActionsCell';

describe('PersonalProjectsTableActionsCell', () => {
  it('shows NameFailureDialog when there is a projectNameFailure', () => {
    const profanity = 'farts';
    const wrapper = mount(
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
    expect(wrapper.find('h1').text()).to.include('Unable to rename project');
    expect(wrapper.find('p').text()).to.include(profanity);
  });

  it('does not show NameFailureDialog without projectNameFailure', () => {
    const wrapper = mount(
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
    expect(wrapper.find('h1')).to.have.lengthOf(0);
    expect(wrapper.find('p')).to.have.lengthOf(0);
  });
});
