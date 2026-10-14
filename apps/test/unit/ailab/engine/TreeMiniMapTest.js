import {render} from '@testing-library/react';
import {createElement} from 'react';

import {NO_ROWS} from '@cdo/apps/ailab/engine/helpers/displayTreeTrace';
import I18n from '@cdo/apps/ailab/engine/i18n';
import {leafColorStyle} from '@cdo/apps/ailab/engine/UIComponents/leafColors';
import TreeMiniMap from '@cdo/apps/ailab/engine/UIComponents/TreeMiniMap';

import moduleStyles from '@cdo/apps/ailab/engine/UIComponents/treeMiniMap.module.scss';

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
  beforeEach(() => I18n.initI18n());
  afterEach(() => I18n.reset());

  test('colors answers by their left-to-right order and questions plainly', () => {
    render(
      createElement(TreeMiniMap, {
        tree: question(question(answer(1), answer(2)), answer(3)),
        datasetId: 'unknown',
        counts: () => NO_ROWS,
        onReplay: () => {},
      })
    );
    const rects = [...document.getElementsByTagName('rect')];
    const answers = rects.filter(rect =>
      rect.classList.contains(moduleStyles.answer)
    );

    expect(
      rects.filter(rect => rect.classList.contains(moduleStyles.question))
    ).toHaveLength(2);
    expect(
      answers.map(rect => rect.style.getPropertyValue('--leaf-color'))
    ).toEqual([0, 1, 2].map(index => leafColorStyle(index)['--leaf-color']));
  });
});
