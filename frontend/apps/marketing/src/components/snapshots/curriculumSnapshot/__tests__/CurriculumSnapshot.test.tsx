import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import CurriculumSnapshot, {
  CurriculumSnapshotProps,
} from '@/components/snapshots/curriculumSnapshot/CurriculumSnapshot';

describe('CurriculumSnapshot component', () => {
  const title = 'Curriculum Snapshot';

  const renderSnapshot = (props: Partial<CurriculumSnapshotProps> = {}) => {
    render(<CurriculumSnapshot {...props} title={title} />);
  };

  it('renders empty list placeholder', () => {
    renderSnapshot();

    const placeholder = screen.getByText(
      (_, node) =>
        node?.tagName === 'EM' &&
        !!node?.textContent?.includes('Curriculum Snapshot placeholder'),
    );

    expect(placeholder).toBeVisible();
  });

  it('renders snapshot Grades item', () => {
    const grades = ['K-1', '2'];

    renderSnapshot({grades});

    const gradesItem = screen.getByText('Grades:').parentElement;
    expect(gradesItem).toBeVisible();
    expect(gradesItem).toHaveTextContent('Grades: K-1, 2');
  });

  it('renders snapshot Level item', () => {
    const level = ['Beginner'];

    renderSnapshot({level});

    const levelItem = screen.getByText('Level:').parentElement;
    expect(levelItem).toBeVisible();
    expect(levelItem).toHaveTextContent('Level: Beginner');
  });

  it('renders snapshot Duration item', () => {
    const duration = ['School Year'];

    renderSnapshot({duration});

    const durationItem = screen.getByText('Duration:').parentElement;
    expect(durationItem).toBeVisible();
    expect(durationItem).toHaveTextContent('Duration: School Year');
  });

  it('renders snapshot Devices item', () => {
    const devices = ['Computer', 'Chromebook'];

    renderSnapshot({devices});

    const devicesItem = screen.getByText('Devices:').parentElement;
    expect(devicesItem).toBeVisible();
    expect(devicesItem).toHaveTextContent('Devices: Computer, Chromebook');
  });

  it('renders snapshot Topics item', () => {
    const topics = ['Data', 'Programming'];

    renderSnapshot({topics});

    const topicsItem = screen.getByText('Topics:').parentElement;
    expect(topicsItem).toBeVisible();
    expect(topicsItem).toHaveTextContent('Topics: Data, Programming');
  });

  it('renders snapshot Programming Tools item', () => {
    const programmingTools = ['App Lab'];

    renderSnapshot({programmingTools});

    const programmingToolsItem =
      screen.getByText('Programming Tools:').parentElement;
    expect(programmingToolsItem).toBeVisible();
    expect(programmingToolsItem).toHaveTextContent(
      'Programming Tools: App Lab',
    );
  });

  it('renders snapshot Professional Learning item', () => {
    const professionalLearning = [
      'Facilitator-led Workshops',
      'Self-paced Modules',
    ];

    renderSnapshot({professionalLearning});

    const professionalLearningItem = screen.getByText(
      'Professional Learning:',
    ).parentElement;
    expect(professionalLearningItem).toBeVisible();
    expect(professionalLearningItem).toHaveTextContent(
      'Professional Learning: Facilitator-led Workshops, Self-paced Modules',
    );
  });

  it('renders snapshot Accessibility item', () => {
    const accessibility = ['Text to Speech', 'Closed captioning'];

    renderSnapshot({accessibility});

    const accessibilityItem = screen.getByText('Accessibility:').parentElement;
    expect(accessibilityItem).toBeVisible();
    expect(accessibilityItem).toHaveTextContent(
      'Accessibility: Text to Speech, Closed captioning',
    );
  });

  it('renders snapshot Languages supported item', () => {
    const languagesSupported = ['English', 'Ukrainian'];

    renderSnapshot({languagesSupported});

    const languagesSupportedItem = screen.getByText(
      'Languages supported:',
    ).parentElement;
    expect(languagesSupportedItem).toBeVisible();
    expect(languagesSupportedItem).toHaveTextContent(
      'Languages supported: English, Ukrainian',
    );
  });
});
