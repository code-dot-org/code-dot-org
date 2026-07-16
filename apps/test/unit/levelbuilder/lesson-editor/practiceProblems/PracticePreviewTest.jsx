import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import PracticePreview from '@cdo/apps/levelbuilder/lesson-editor/practiceProblems/PracticePreview';

describe('PracticePreview', () => {
  it('marks the correct multiple-choice option', () => {
    const problem = {
      problemType: 'multiple_choice_single_select',
      problemText: 'Which is a loop?',
      solution: [
        {option: 'for', correct: true},
        {option: 'if', correct: false},
      ],
      objectiveIds: [],
    };
    const wrapper = mount(<PracticePreview problem={problem} />);
    expect(wrapper.text()).toContain('Which is a loop?');
    expect(wrapper.text()).toContain('for');
    expect(wrapper.text()).toContain('if');
    // exactly one correct-answer marker (asserted on the stable wrapper class
    // rather than the DSCO icon component, which doesn't resolve reliably
    // across jest's shared worker)
    expect(wrapper.find('.correctMark').length).toBe(1);
  });

  it('shows match pairs as option → match', () => {
    const problem = {
      problemType: 'match',
      problemText: 'Match them',
      solution: [{option: 'puppy', correct: 'kibble'}],
      objectiveIds: [],
    };
    const wrapper = mount(<PracticePreview problem={problem} />);
    expect(wrapper.text()).toContain('puppy → kibble');
  });

  it('groups sort options under their category', () => {
    const problem = {
      problemType: 'sort',
      problemText: 'Sort them',
      solution: [
        {option: 'apple', correct: 'Fruit'},
        {option: 'carrot', correct: 'Vegetable'},
        {option: 'pear', correct: 'Fruit'},
      ],
      objectiveIds: [],
    };
    const wrapper = mount(<PracticePreview problem={problem} />);
    expect(wrapper.text()).toContain('Fruit');
    expect(wrapper.text()).toContain('Vegetable');
    expect(wrapper.text()).toContain('apple');
    expect(wrapper.text()).toContain('pear');
  });

  it('renders scramble items in correct order', () => {
    const problem = {
      problemType: 'scramble',
      problemText: 'Order them',
      // deliberately out of order; preview should sort by `correct`
      solution: [
        {option: 'second', correct: 1},
        {option: 'first', correct: 0},
        {option: 'third', correct: 2},
      ],
      objectiveIds: [],
    };
    const wrapper = mount(<PracticePreview problem={problem} />);
    const items = wrapper.find('ol li').map(li => li.text());
    expect(items).toEqual(['first', 'second', 'third']);
  });
});
