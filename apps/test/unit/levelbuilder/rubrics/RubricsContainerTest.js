import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import RubricsContainer from '@cdo/apps/levelbuilder/rubrics/RubricsContainer';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';

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
    sinon.restore();
  });

  const renderComponent = props =>
    render(<RubricsContainer {...defaultProps} {...props} />);

  it('renders the components on the page correctly for a new rubric', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', {name: 'Create your rubric'})
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(
      defaultProps.submittableLevels.length
    );
    expect(
      screen.getByRole('button', {name: 'Add new Key Concept'})
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', {name: 'Delete key concept'})
    ).toHaveLength(1);
    expect(
      screen.getByRole('button', {name: 'Save your rubric'})
    ).toBeInTheDocument();
  });

  it('renders "the components on the page correctly for an exisiting rubric"', () => {
    renderComponent({rubric: rubricInfo});

    expect(
      screen.getByRole('heading', {name: 'Modify your rubric'})
    ).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(
      defaultProps.submittableLevels.length
    );
    expect(screen.getAllByLabelText('Key Concept:')).toHaveLength(
      rubricInfo.learningGoals.length
    );
    expect(
      screen.getByRole('button', {name: 'Save your rubric'})
    ).toBeInTheDocument();
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

  it('adds a deletes learning goal on "Delete Key Concept" button click', async () => {
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

    const dropdown = screen.getByRole('combobox');
    expect(dropdown).toHaveValue(String(defaultProps.submittableLevels[0].id));

    await user.selectOptions(
      dropdown,
      String(defaultProps.submittableLevels[1].id)
    );

    expect(dropdown).toHaveValue(String(defaultProps.submittableLevels[1].id));
  });

  it('changes the saveNotificationText and disables the save Button when saving rubric', async () => {
    const user = userEvent.setup();
    const mockFetch = sinon.stub(global, 'fetch');
    let resolveFetch;
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve;
    });
    mockFetch.returns(fetchPromise);

    renderComponent({rubric: rubricInfo});

    expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
    expect(screen.queryByText('Save complete!')).not.toBeInTheDocument();

    // Simulate the save button click
    const saveButton = screen.getByRole('button', {name: 'Save your rubric'});
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    expect(await screen.findByText('Saving...')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    await act(async () => {
      resolveFetch(
        new Response(
          JSON.stringify({
            learningGoals: rubricInfo.learningGoals,
          })
        )
      );
      await fetchPromise;
    });

    expect(await screen.findByText('Save complete!')).toBeInTheDocument();
    expect(saveButton).toBeEnabled();
  });
});
