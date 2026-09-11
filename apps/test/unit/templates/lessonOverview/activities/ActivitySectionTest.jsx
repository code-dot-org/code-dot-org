import {CdoTheme} from '@code-dot-org/component-library/themes';
import {Markdown} from '@code-dot-org/markdown';
import {ThemeProvider} from '@mui/material/styles';
import {fireEvent, render, screen} from '@testing-library/react';
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

  describe('expandable images', () => {
    // 408 activity section descriptions use this syntax, all of them with the
    // bare alt text "expandable".
    const sectionWithExpandableImage = {
      ...sampleActivities[0].activitySections[0],
      text: '![a circuit expandable](https://images.code.org/circuit.png)',
    };

    it('opens the image dialog when the image is activated', async () => {
      const onExpandImage = jest.fn();
      render(
        <ActivitySection
          section={sectionWithExpandableImage}
          onExpandImage={onExpandImage}
        />
      );

      fireEvent.click(
        screen.getByRole('button', {name: 'Expand image: a circuit'})
      );

      expect(onExpandImage).toHaveBeenCalledWith(
        'https://images.code.org/circuit.png',
        'a circuit'
      );
    });

    it('renders the image inline when no handler is supplied', () => {
      // The levelbuilder preview path: a button with nothing behind it would
      // be worse than a plain image.
      render(<ActivitySection section={sectionWithExpandableImage} />);

      expect(screen.queryByRole('button')).toBeNull();
      expect(screen.getByRole('img', {name: 'a circuit'})).toBeInTheDocument();
    });
  });

  describe('vocabulary references', () => {
    // The server leaves `[v key]` in the section text and ships the
    // definitions separately; see Lesson#vocabulary_definitions.
    const sectionWithVocabulary = {
      ...sampleActivities[0].activitySections[0],
      text: 'The openings in our blocks are [v parameter/csd/2021]s.',
    };

    it('renders a defined term with its definition in a tooltip', async () => {
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

      const term = screen.getByText('parameter');
      // Keyboard-reachable, unlike the native title tooltip it replaced.
      expect(term.getAttribute('tabindex')).toBe('0');

      fireEvent.mouseOver(term);
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip.textContent).toBe('an input to a function');
    });

    it('describes the term with the definition under the app theme', async () => {
      // apps renders every root inside CdoTheme (see createReactRoot), whose
      // MuiTooltip defaults set describeChild: the definition becomes the
      // term's description rather than its name.
      render(
        <ThemeProvider theme={CdoTheme}>
          <ActivitySection
            section={sectionWithVocabulary}
            vocabularyDefinitions={{
              'parameter/csd/2021': {
                word: 'parameter',
                definition: 'an input to a function',
              },
            }}
          />
        </ThemeProvider>
      );

      const term = screen.getByText('parameter');
      fireEvent.mouseOver(term);

      const tooltip = await screen.findByRole('tooltip');
      expect(term.getAttribute('aria-describedby')).toBe(tooltip.id);
      expect(term.getAttribute('aria-label')).toBeNull();
    });

    it('renders an undefined term as plain text', () => {
      render(
        <ActivitySection
          section={sectionWithVocabulary}
          vocabularyDefinitions={{}}
        />
      );

      expect(document.querySelector('[tabindex]')).toBeNull();
      expect(screen.getByText(/parameter\/csd\/2021/)).toBeInTheDocument();
    });
  });
});
