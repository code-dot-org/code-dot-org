import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';

import RubricsContainer from '@cdo/apps/levelbuilder/rubrics/RubricsContainer';
import {navigateToHref} from '@cdo/apps/utils';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/utils', () => ({
  navigateToHref: jest.fn(),
}));

describe('RubricsContainerTest', () => {
  const defaultProps = {
    submittableLevels: [
      {id: 1, name: 'level 1'},
      {id: 2, name: 'level 2'},
      {id: 3, name: 'level 3'},
    ],
    unitName: 'sample unit',
    lessonNumber: 0,
  };

  const rubricInfo = {
    learningGoals: [
      {
        key: 'ui-1',
        id: 'ui-1',
        learningGoal: '',
        aiEnabled: false,
        position: 1,
        learningGoalEvidenceLevelsAttributes: [
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.NONE,
            aiPrompt: '',
          },
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.LIMITED,
            aiPrompt: '',
          },
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.CONVINCING,
            aiPrompt: '',
          },
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.EXTENSIVE,
            aiPrompt: '',
          },
        ],
      },
      {
        key: 'ui-2',
        id: 'ui-2',
        learningGoal: '',
        aiEnabled: false,
        position: 2,
        learningGoalEvidenceLevelsAttributes: [
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.NONE,
            aiPrompt: '',
          },
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.LIMITED,
            aiPrompt: '',
          },
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.CONVINCING,
            aiPrompt: '',
          },
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.EXTENSIVE,
            aiPrompt: '',
          },
        ],
      },
    ],
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderComponent = props =>
    render(<RubricsContainer {...defaultProps} {...props} />);

  it('renders the components on the page correctly for a new rubric', () => {
    renderComponent();

    screen.getByRole('heading', {name: 'Create your rubric'});
    screen.getByLabelText('Choose a level for this rubric to be evaluated on');
    expect(screen.getAllByRole('option')).toHaveLength(
      defaultProps.submittableLevels.length
    );
    screen.getByRole('button', {name: 'Add new Key Concept'});
    screen.getByRole('button', {name: 'Delete key concept'});
    screen.getByRole('button', {name: 'Save your rubric'});
  });

  it('renders "the components on the page correctly for an exisiting rubric"', () => {
    renderComponent({rubric: rubricInfo});

    screen.getByRole('heading', {name: 'Modify your rubric'});
    expect(screen.getAllByRole('option')).toHaveLength(
      defaultProps.submittableLevels.length
    );
    expect(screen.getAllByLabelText('Key Concept:')).toHaveLength(
      rubricInfo.learningGoals.length
    );
    screen.getByRole('button', {name: 'Save your rubric'});
  });

  it('adds a new learning goal on "Add new Key Concept" button click', async () => {
    const user = userEvent.setup();
    renderComponent();

    const initialDeleteButtons = screen.getAllByRole('button', {
      name: 'Delete key concept',
    });
    await user.click(screen.getByRole('button', {name: 'Add new Key Concept'}));

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', {name: 'Delete key concept'})
      ).toHaveLength(initialDeleteButtons.length + 1);
    });
  });

  it('deletes learning goal on "Delete Key Concept" button click', async () => {
    const user = userEvent.setup();
    renderComponent();

    const initialDeleteButtons = screen.getAllByRole('button', {
      name: 'Delete key concept',
    });
    await user.click(screen.getByRole('button', {name: 'Delete key concept'}));

    await waitFor(() => {
      expect(
        screen.queryAllByRole('button', {name: 'Delete key concept'})
      ).toHaveLength(initialDeleteButtons.length - 1);
    });
  });

  it('changes the selected level for assessment when the dropdown is changed', async () => {
    const user = userEvent.setup();
    renderComponent();

    const dropdown = screen.getByLabelText(
      'Choose a level for this rubric to be evaluated on'
    );
    expect(dropdown).toHaveValue(String(defaultProps.submittableLevels[0].id));

    await user.selectOptions(
      dropdown,
      String(defaultProps.submittableLevels[1].id)
    );

    expect(dropdown).toHaveValue(String(defaultProps.submittableLevels[1].id));
  });

  const rubricWithId = {
    id: 42,
    levelId: 1,
    ...rubricInfo,
  };

  describe('Delete Rubric button', () => {
    it('does not render when allowMajorCurriculumChanges is false', () => {
      renderComponent({
        rubric: rubricWithId,
        allowMajorCurriculumChanges: false,
      });
      expect(
        screen.queryByRole('button', {name: 'Delete Rubric'})
      ).not.toBeInTheDocument();
    });

    it('does not render when no existing rubric (new rubric)', () => {
      renderComponent({allowMajorCurriculumChanges: true});
      expect(
        screen.queryByRole('button', {name: 'Delete Rubric'})
      ).not.toBeInTheDocument();
    });

    it('renders when allowMajorCurriculumChanges is true and rubric exists', () => {
      renderComponent({
        rubric: rubricWithId,
        allowMajorCurriculumChanges: true,
      });
      screen.getByRole('button', {name: 'Delete Rubric'});
    });

    it('shows confirmation dialog on click', async () => {
      const user = userEvent.setup();
      renderComponent({
        rubric: rubricWithId,
        allowMajorCurriculumChanges: true,
      });

      await user.click(screen.getByRole('button', {name: 'Delete Rubric'}));

      screen.getByRole('dialog');
      screen.getByRole('button', {name: 'Cancel'});
      screen.getByRole('button', {name: 'Delete'});
    });

    it('closes dialog and does not delete on Cancel', async () => {
      const user = userEvent.setup();
      renderComponent({
        rubric: rubricWithId,
        allowMajorCurriculumChanges: true,
      });

      await user.click(screen.getByRole('button', {name: 'Delete Rubric'}));
      screen.getByRole('dialog');

      await user.click(screen.getByRole('button', {name: 'Cancel'}));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(navigateToHref).not.toHaveBeenCalled();
    });

    it('calls DELETE and navigates to lesson edit path on confirm', async () => {
      const user = userEvent.setup();
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(
          new Response(JSON.stringify({lessonEditPath: '/lessons/5/edit'}))
        );

      renderComponent({
        rubric: rubricWithId,
        allowMajorCurriculumChanges: true,
      });

      await user.click(screen.getByRole('button', {name: 'Delete Rubric'}));
      await user.click(screen.getByRole('button', {name: 'Delete'}));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/rubrics/${rubricWithId.id}`,
          expect.objectContaining({method: 'DELETE'})
        );
        expect(navigateToHref).toHaveBeenCalledWith('/lessons/5/edit');
      });
    });
  });

  it('changes the saveNotificationText when saving rubric', async () => {
    const user = userEvent.setup();

    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          learningGoals: rubricInfo.learningGoals,
        })
      )
    );

    renderComponent({rubric: rubricInfo});

    expect(screen.queryByText('Saving...')).toBeNull();
    expect(screen.queryByText('Save complete!')).toBeNull();

    // Simulate the save button click
    const saveButton = screen.getByRole('button', {name: 'Save your rubric'});
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    await screen.findByText('Save complete!');
  });
});
