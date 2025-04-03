import {render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom';

import LabSnapshot, {
  LabSnapshotProps,
} from '@/components/snapshots/labSnapshot/LabSnapshot';

describe('LabSnapshot component', () => {
  const title = 'Lab Snapshot';

  const renderSnapshot = (props: Partial<LabSnapshotProps> = {}) => {
    render(<LabSnapshot {...props} title={title} />);
  };

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
      ages: ['1', '1st'],
      level: ['2', '2nd'],
      creation: '3, 3rd',
      devices: ['4', '4th'],
      browsers: ['5', '5th'],
      accessibility: ['6', '6th'],
      languages: ['7', '7th'],
    });

    const labSnapshot = screen.getByTitle(title);
    expect(labSnapshot).toBeVisible();

    const labDetails = within(labSnapshot).getAllByRole('listitem');
    expect(labDetails[0]).toHaveTextContent('Ages: 1, 1st');
    expect(labDetails[1]).toHaveTextContent('Level: 2, 2nd');
    expect(labDetails[2]).toHaveTextContent('What you can make: 3, 3rd');
    expect(labDetails[3]).toHaveTextContent('Devices: 4, 4th');
    expect(labDetails[4]).toHaveTextContent('Browsers: 5, 5th');
    expect(labDetails[5]).toHaveTextContent('Accessibility: 6, 6th');
    expect(labDetails[6]).toHaveTextContent('Languages supported: 7, 7th');
  });
});
