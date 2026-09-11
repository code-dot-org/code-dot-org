import {Markdown} from '@code-dot-org/markdown';
import {fireEvent, render, screen} from '@testing-library/react';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LessonTip from '@cdo/apps/templates/lessonOverview/activities/LessonTip';

describe('LessonTip', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      tip: {
        key: 'tip-1',
        type: 'teachingTip',
        markdown: 'Teaching tip content',
      },
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<LessonTip {...defaultProps} />);
    // tip
    expect(wrapper.contains('Teaching Tip')).toBe(true);
    expect(wrapper.find(Markdown).length).toBe(1);
    expect(wrapper.find(Markdown).first().props().content).toContain(
      'Teaching tip content'
    );
  });

  it('collapses tip when header is pressed', () => {
    const wrapper = shallow(<LessonTip {...defaultProps} />);
    wrapper.find('.unit-test-tip-tab').simulate('click');
    expect(wrapper.find(Markdown).length).toBe(0);
  });

  it('expands a collapsed tip when header is pressed', () => {
    const wrapper = shallow(<LessonTip {...defaultProps} />);
    wrapper.instance().setState({expanded: false});
    wrapper.find('.unit-test-tip-tab').simulate('click');
    expect(wrapper.find(Markdown).length).toBe(1);
  });

  it('resolves vocabulary references against the supplied definitions', async () => {
    render(
      <LessonTip
        tip={{
          ...defaultProps.tip,
          markdown: 'Discuss [v lossy_compression/csp/2021] first.',
        }}
        vocabularyDefinitions={{
          'lossy_compression/csp/2021': {
            word: 'lossy compression',
            definition: 'Reducing file size by discarding data.',
          },
        }}
      />
    );

    fireEvent.mouseOver(screen.getByText('lossy compression'));
    expect((await screen.findByRole('tooltip')).textContent).toBe(
      'Reducing file size by discarding data.'
    );
  });
});
