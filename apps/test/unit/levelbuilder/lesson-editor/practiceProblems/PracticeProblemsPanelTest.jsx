import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {act} from 'react-dom/test-utils';

import PracticeProblemsPanel from '@cdo/apps/levelbuilder/lesson-editor/practiceProblems/PracticeProblemsPanel';

import {
  allowConsoleWarnings,
  allowConsoleErrors,
} from '../../../../util/throwOnConsole';

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('PracticeProblemsPanel', () => {
  // MUI ButtonBase's ripple triggers a findDOMNode deprecation warning
  // (surfaced by React 18 as a console.error).
  allowConsoleWarnings();
  allowConsoleErrors();

  const objectives = [
    {id: 1, description: 'Obj one', key: 'o1'},
    {id: 2, description: 'Obj two', key: 'o2'},
  ];

  const defaultProps = {
    lessonId: 42,
    objectives,
    initialProblems: [
      {
        id: 10,
        key: 'pp-a',
        problemType: 'match',
        problemText: 'Match the terms',
        solution: [{option: 'a', correct: 'b'}],
        objectiveIds: [1],
      },
    ],
  };

  let fetchSpy;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders a row per existing problem with resolved objectives', () => {
    const wrapper = mount(<PracticeProblemsPanel {...defaultProps} />);
    expect(wrapper.find('tbody tr').length).toBe(1);
    expect(wrapper.text()).toContain('Match the terms');
    expect(wrapper.text()).toContain('Match'); // type label
    expect(wrapper.text()).toContain('Obj one'); // resolved objective
  });

  it('shows an empty state with no problems', () => {
    const wrapper = mount(
      <PracticeProblemsPanel {...defaultProps} initialProblems={[]} />
    );
    expect(wrapper.text()).toContain('No practice problems yet.');
  });

  it('POSTs to the generate endpoint scoped to the lesson', async () => {
    fetchSpy = jest
      .spyOn(window, 'fetch')
      .mockResolvedValue({ok: true, json: () => Promise.resolve([])});
    const wrapper = mount(<PracticeProblemsPanel {...defaultProps} />);

    // Run the click and let the async generate settle within act() so the
    // resulting state updates don't fire after the test ends.
    await act(async () => {
      wrapper
        .findWhere(
          n => n.name() === 'button' && n.text().includes('Generate with AI')
        )
        .first()
        .simulate('click');
      await flushPromises();
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/practice_problems/generate',
      expect.objectContaining({method: 'POST'})
    );
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body).toEqual({lesson_id: 42, count: 5});

    wrapper.unmount();
  });

  it('opens a type picker from Add manually, then the editor for a chosen type', () => {
    const wrapper = mount(<PracticeProblemsPanel {...defaultProps} />);

    wrapper
      .findWhere(
        n => n.name() === 'button' && n.text().includes('Add manually')
      )
      .first()
      .simulate('click');

    // The picker offers all five types; no editor yet.
    expect(wrapper.text()).toContain('Choose a question type');
    expect(wrapper.find('PracticeProblemEditor').length).toBe(0);

    // Choosing a type opens the editor for a blank problem of that type.
    wrapper
      .findWhere(n => n.name() === 'button' && n.text() === 'Match')
      .first()
      .simulate('click');

    const editor = wrapper.find('PracticeProblemEditor');
    expect(editor.length).toBe(1);
    expect(editor.prop('problem')).toMatchObject({
      problemType: 'match',
      problemText: '',
    });
  });

  it('POSTs a new problem when a manually-added problem is saved', async () => {
    fetchSpy = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 77,
          problemType: 'match',
          problemText: 'Manual Q',
          solution: [],
          objectiveIds: [],
        }),
    });
    const wrapper = mount(<PracticeProblemsPanel {...defaultProps} />);

    wrapper
      .findWhere(
        n => n.name() === 'button' && n.text().includes('Add manually')
      )
      .first()
      .simulate('click');
    wrapper
      .findWhere(n => n.name() === 'button' && n.text() === 'Match')
      .first()
      .simulate('click');

    await act(async () => {
      wrapper.find('PracticeProblemEditor').prop('onSave')({
        problemType: 'match',
        problemText: 'Manual Q',
        solution: [{option: 'a', correct: 'b'}],
        objectiveIds: [],
        active: true,
      });
      await flushPromises();
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/practice_problems',
      expect.objectContaining({method: 'POST'})
    );

    wrapper.unmount();
  });
});
