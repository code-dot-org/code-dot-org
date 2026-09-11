import {Markdown} from '@code-dot-org/markdown';
import {render, screen} from '@testing-library/react';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ActivitySection from '@cdo/apps/templates/lessonOverview/activities/ActivitySection';

import {sampleActivities} from '../../../levelbuilder/lesson-editor/activitiesTestData';

describe('ActivitySection', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      section: sampleActivities[0].activitySections[0],
    };
  });

  it('Renders description section with remarks correctly', () => {
    const wrapper = shallow(<ActivitySection {...defaultProps} />);
    expect(wrapper.find('ProgressionDetails').length).toBe(0);
    expect(wrapper.find(Markdown).length).toBe(1);
    expect(wrapper.contains('Remarks')).toBe(true);
    expect(wrapper.find('FontAwesome[icon="microphone"]').length).toBe(1);
  });

  it('Shows progression details if there are levels', () => {
    const wrapper = shallow(
      <ActivitySection section={sampleActivities[0].activitySections[2]} />
    );
    expect(wrapper.find('ProgressionDetails').length).toBe(1);
    expect(wrapper.find(Markdown).length).toBe(1);
  });

  it('Shows correct number of lesson tips', () => {
    const wrapper = shallow(
      <ActivitySection section={sampleActivities[0].activitySections[1]} />
    );
    expect(wrapper.find('LessonTip').length).toBe(2);
  });

  it('renders an image whose uploaded filename contains spaces', () => {
    // The shape 97 activity section descriptions use; see the
    // lenientLinkDestinations extension.
    render(
      <ActivitySection
        section={{
          ...sampleActivities[0].activitySections[0],
          text: '![a cup stack](https://images.code.org/9b0af-cup stack ideas.png)',
        }}
      />
    );

    expect(
      screen.getByRole('img', {name: 'a cup stack'}).getAttribute('src')
    ).toBe('https://images.code.org/9b0af-cup%20stack%20ideas.png');
  });

  describe('vocabulary references', () => {
    // The server leaves `[v key]` in the section text and ships the
    // definitions separately; see Lesson#vocabulary_definitions.
    const sectionWithVocabulary = {
      ...sampleActivities[0].activitySections[0],
      text: 'The openings in our blocks are [v parameter/csd/2021]s.',
    };

    it('renders a defined term with its definition as a tooltip', () => {
      render(
        <ActivitySection
          section={sectionWithVocabulary}
          vocabularyDefinitions={{
            'parameter/csd/2021': {
              word: 'parameter',
              definition: 'an input to a function',
            },
          }}
        />
      );

      expect(screen.getByTitle('an input to a function').textContent).toBe(
        'parameter'
      );
    });

    it('renders an undefined term as plain text', () => {
      render(
        <ActivitySection
          section={sectionWithVocabulary}
          vocabularyDefinitions={{}}
        />
      );

      expect(screen.queryByTitle(/./)).toBeNull();
      expect(screen.getByText(/parameter\/csd\/2021/)).toBeInTheDocument();
    });
  });
});
