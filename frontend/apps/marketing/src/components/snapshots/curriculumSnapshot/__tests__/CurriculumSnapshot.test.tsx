import {render, screen, within} from '@testing-library/react';
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

  it('renders curriculum details in the correct order', () => {
    renderSnapshot({
      grades: ['1', '1st'],
      level: ['2', '2nd'],
      duration: ['3', '3rd'],
      devices: ['4', '4th'],
      topics: ['5', '5th'],
      programmingTools: ['6', '6th'],
      professionalLearning: ['7', '7th'],
      accessibility: ['8', '8th'],
      languagesSupported: ['9', '9th'],
    });

    const curriculumSnapshot = screen.getByTitle(title);
    expect(curriculumSnapshot).toBeVisible();

    const curriculumDetails =
      within(curriculumSnapshot).getAllByRole('listitem');
    expect(curriculumDetails[0]).toHaveTextContent('Grades: 1, 1st');
    expect(curriculumDetails[1]).toHaveTextContent('Level: 2, 2nd');
    expect(curriculumDetails[2]).toHaveTextContent('Duration: 3, 3rd');
    expect(curriculumDetails[3]).toHaveTextContent('Devices: 4, 4th');
    expect(curriculumDetails[4]).toHaveTextContent('Topics: 5, 5th');
    expect(curriculumDetails[5]).toHaveTextContent('Programming Tools: 6, 6th');
    expect(curriculumDetails[6]).toHaveTextContent(
      'Professional Learning: 7, 7th',
    );
    expect(curriculumDetails[7]).toHaveTextContent('Accessibility: 8, 8th');
    expect(curriculumDetails[8]).toHaveTextContent(
      'Languages supported: 9, 9th',
    );
  });
});
