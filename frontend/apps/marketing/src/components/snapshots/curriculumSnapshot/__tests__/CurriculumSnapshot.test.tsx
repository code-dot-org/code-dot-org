import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import CurriculumSnapshot, {
  CurriculumSnapshotProps,
} from '@/components/snapshots/curriculumSnapshot/CurriculumSnapshot';

describe('CurriculumSnapshot component', () => {
  const label = 'Curriculum Snapshot';

  const renderSnapshot = (props: Partial<CurriculumSnapshotProps> = {}) => {
    render(<CurriculumSnapshot {...props} label={label} />);
  };

  const getSnapshot = () => screen.getByLabelText(label);

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
      grades: ['1', '1st; '],
      level: ['2', '2nd; '],
      duration: ['3', '3rd; '],
      devices: ['4', '4th; '],
      topics: ['5', '5th; '],
      devTools: ['6', '6th; '],
      proLearning: ['7', '7th; '],
      accessibility: ['8', '8th; '],
      languages: ['9', '9th'],
    });

    const curriculumSnapshot = getSnapshot();

    expect(curriculumSnapshot).toBeVisible();
    expect(curriculumSnapshot).toHaveTextContent(
      'Grades: 1, 1st; Level: 2, 2nd; Duration: 3, 3rd; Devices: 4, 4th; Topics: 5, 5th; ' +
        'Programming Tools: 6, 6th; Professional Learning: 7, 7th; Accessibility: 8, 8th; Languages supported: 9, 9th',
    );
  });

  it('renders only non-empty details', () => {
    renderSnapshot({
      grades: ['1'],
      level: [],
    });

    const curriculumSnapshot = getSnapshot();

    expect(curriculumSnapshot).toBeVisible();
    expect(curriculumSnapshot).toHaveTextContent('Grades: 1');
  });
});
