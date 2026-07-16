import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import PracticeProblemEditor from '@cdo/apps/levelbuilder/lesson-editor/practiceProblems/PracticeProblemEditor';

import {
  allowConsoleWarnings,
  allowConsoleErrors,
} from '../../../../util/throwOnConsole';

describe('PracticeProblemEditor', () => {
  // MUI ButtonBase's ripple triggers a findDOMNode deprecation warning
  // (surfaced by React 18 as a console.error).
  allowConsoleWarnings();
  allowConsoleErrors();

  const objectives = [{id: 1, description: 'Obj one', key: 'o1'}];

  const mcProblem = {
    problemType: 'multiple_choice_single_select',
    problemText: 'Pick one',
    solution: [
      {option: 'a', correct: true},
      {option: 'b', correct: false},
    ],
    objectiveIds: [],
  };

  it('edits the question text and saves the update', () => {
    const onSave = jest.fn();
    const wrapper = mount(
      <PracticeProblemEditor
        problem={mcProblem}
        objectives={objectives}
        onSave={onSave}
        onCancel={jest.fn()}
      />
    );

    wrapper
      .find('textarea#practice-problem-text')
      .simulate('change', {target: {value: 'New question'}});
    wrapper
      .findWhere(n => n.name() === 'button' && n.text() === 'Save')
      .first()
      .simulate('click');

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0].problemText).toBe('New question');
  });

  it('single-select keeps exactly one correct option', () => {
    const onSave = jest.fn();
    const wrapper = mount(
      <PracticeProblemEditor
        problem={mcProblem}
        objectives={objectives}
        onSave={onSave}
        onCancel={jest.fn()}
      />
    );

    // click the second option's radio -> it becomes the only correct one
    wrapper
      .find('input[type="radio"]')
      .at(1)
      .simulate('change', {
        target: {checked: true},
      });
    wrapper
      .findWhere(n => n.name() === 'button' && n.text() === 'Save')
      .first()
      .simulate('click');

    const saved = onSave.mock.calls[0][0];
    expect(saved.solution.map(s => s.correct)).toEqual([false, true]);
  });

  it('reindexes scramble order on save', () => {
    const onSave = jest.fn();
    const scramble = {
      problemType: 'scramble',
      problemText: 'Order',
      solution: [
        {option: 'first', correct: 0},
        {option: 'second', correct: 1},
      ],
      objectiveIds: [],
    };
    const wrapper = mount(
      <PracticeProblemEditor
        problem={scramble}
        objectives={objectives}
        onSave={onSave}
        onCancel={jest.fn()}
      />
    );

    // move the first item down
    wrapper
      .findWhere(
        n =>
          n.name() === 'button' && n.prop('aria-label') === 'Move item 1 down'
      )
      .first()
      .simulate('click');
    wrapper
      .findWhere(n => n.name() === 'button' && n.text() === 'Save')
      .first()
      .simulate('click');

    const saved = onSave.mock.calls[0][0];
    expect(saved.solution).toEqual([
      {option: 'second', correct: 0},
      {option: 'first', correct: 1},
    ]);
  });

  it('adds an option', () => {
    const onSave = jest.fn();
    const wrapper = mount(
      <PracticeProblemEditor
        problem={mcProblem}
        objectives={objectives}
        onSave={onSave}
        onCancel={jest.fn()}
      />
    );

    wrapper
      .findWhere(n => n.name() === 'button' && n.text() === 'Add option')
      .first()
      .simulate('click');
    wrapper
      .findWhere(n => n.name() === 'button' && n.text() === 'Save')
      .first()
      .simulate('click');

    expect(onSave.mock.calls[0][0].solution).toHaveLength(3);
  });
});
