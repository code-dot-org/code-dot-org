import { expect } from 'chai';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';

import { ProgressDot } from '../../src/js/components/progress/progress_dot';

describe('ProgressDot component tests', () => {
  let renderer, level;

  beforeEach(() => {
    renderer = ReactTestUtils.createRenderer();
    level = {
      uid: '123',
      title: 1,
      name: 'Test Level',
      status: 'attempted',
      kind: 'puzzle',
      url: '/test-url'
    };
  });

  it('adds an onClick handler when saveAnswersBeforeNavigation is true', () => {
    renderer.render(
      <ProgressDot saveAnswersBeforeNavigation={true} level={level} />
    );

    const result = renderer.getRenderOutput();
    expect(result.type).to.equal('a');
    expect(result.props.onClick).to.exist;
  });
});
