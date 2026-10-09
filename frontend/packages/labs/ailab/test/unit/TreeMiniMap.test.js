import {render} from '@testing-library/react';
import {createElement} from 'react';

import {leafColorStyle} from '../../src/UIComponents/leafColors';
import TreeMiniMap from '../../src/UIComponents/TreeMiniMap';

import moduleStyles from '../../src/UIComponents/treeMiniMap.module.scss';

const answer = prediction => ({type: 'answer', prediction});
const question = (left, right) => ({
  type: 'question',
  column: 'c',
  branches: [
    {kind: 'values', values: ['a'], child: left},
    {kind: 'values', values: ['b'], child: right},
  ],
});

describe('TreeMiniMap', () => {
  test('colors answers by their left-to-right order and questions plainly', () => {
    render(
      createElement(TreeMiniMap, {
        tree: question(question(answer(1), answer(2)), answer(3)),
        nodeWidth: () => 100,
        onReplay: () => {},
      }),
    );
    const rects = [...document.getElementsByTagName('rect')];
    const answers = rects.filter(rect =>
      rect.classList.contains(moduleStyles.answer),
    );

    expect(
      rects.filter(rect => rect.classList.contains(moduleStyles.question)),
    ).toHaveLength(2);
    expect(
      answers.map(rect => rect.style.getPropertyValue('--leaf-color')),
    ).toEqual([0, 1, 2].map(index => leafColorStyle(index)['--leaf-color']));
  });
});
