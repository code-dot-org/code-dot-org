import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import LabSnapshot, {
  LabSnapshotProps,
} from '@/components/contentful/snapshots/labSnapshot/LabSnapshot';

describe('LabSnapshot component', () => {
  const label = 'Lab Snapshot';

  const renderSnapshot = (props: Partial<LabSnapshotProps> = {}) => {
    render(<LabSnapshot {...props} label={label} />);
  };

  const getSnapshot = () => screen.getByLabelText(label);

  it('renders empty list placeholder', () => {
    renderSnapshot();

    const placeholder = screen.getByText(
      (_, node) =>
        node?.tagName === 'EM' &&
        !!node?.textContent?.includes('Lab Snapshot placeholder'),
    );

    expect(placeholder).toBeVisible();
  });

  it('renders lab details in the correct order', () => {
    renderSnapshot({
      ages: ['1', '1st; '],
      level: ['2', '2nd; '],
      creation: '3, 3rd; ',
      devices: ['4', '4th; '],
      browsers: ['5', '5th; '],
      accessibility: ['6', '6th; '],
      languages: ['7', '7th'],
    });

    const labSnapshot = getSnapshot();

    expect(labSnapshot).toBeVisible();
    expect(labSnapshot).toHaveTextContent(
      'Ages: 1, 1st; Level: 2, 2nd; What you can make: 3, 3rd; Devices: 4, 4th; ' +
        'Browsers: 5, 5th; Accessibility: 6, 6th; Languages supported: 7, 7th',
    );
  });

  it('renders only non-empty details', () => {
    renderSnapshot({
      ages: ['1'],
      level: [],
      creation: '',
    });

    const labSnapshot = getSnapshot();

    expect(labSnapshot).toBeVisible();
    expect(labSnapshot).toHaveTextContent('Ages: 1');
  });

  it('renders ages in ascending order', () => {
    renderSnapshot({
      ages: [
        '15',
        '16',
        '17',
        '18',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
      ],
    });

    const curriculumSnapshot = getSnapshot();

    expect(curriculumSnapshot).toHaveTextContent(
      'Ages: 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18',
    );
  });
});
