import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, it, expect, vi} from 'vitest';

import Congratulations from '../Congratulations';
import {CURRICULA, curriculumForCourse, firstLevelUrl} from '../curricula';

const oceans = CURRICULA.find(curriculum => curriculum.id === 'oceans')!;

describe('Congratulations', () => {
  it('names the finished curriculum and offers both choices', async () => {
    const onTryAgain = vi.fn();
    const onChooseAnother = vi.fn();
    render(
      <Congratulations
        curriculum={oceans}
        onTryAgain={onTryAgain}
        onChooseAnother={onChooseAnother}
      />,
    );
    expect(
      screen.getByRole('heading', {level: 1, name: 'Congratulations!'}),
    ).toBeInTheDocument();
    expect(screen.getByText('AI for Oceans')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', {name: 'Try again'}));
    expect(onTryAgain).toHaveBeenCalledWith(oceans);
    await userEvent.click(
      screen.getByRole('button', {name: 'Choose another curriculum'}),
    );
    expect(onChooseAnother).toHaveBeenCalledTimes(1);
  });

  it('offers only another curriculum when the curriculum is unknown', () => {
    render(
      <Congratulations
        curriculum={undefined}
        onTryAgain={vi.fn()}
        onChooseAnother={vi.fn()}
      />,
    );
    expect(
      screen.getByText('You finished the curriculum.'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});

describe('curriculumForCourse', () => {
  it('matches the course in each kind of curriculum URL', () => {
    expect(curriculumForCourse('oceans')?.id).toBe('oceans');
    expect(curriculumForCourse('express-2025')?.id).toBe('express-2025');
    expect(curriculumForCourse('flappy')?.id).toBe('flappy');
    expect(curriculumForCourse('courseb-2025')?.id).toBe(
      'csf-courseb-2025-sequencing-angry-birds',
    );
  });

  it('is undefined for unknown, shared or free-play courses', () => {
    expect(curriculumForCourse('')).toBeUndefined();
    expect(curriculumForCourse('hourofcode')).toBeUndefined();
    // Two curricula are lessons of Course D.
    expect(curriculumForCourse('coursed-2025')).toBeUndefined();
    expect(curriculumForCourse('projects')).toBeUndefined();
  });
});

describe('firstLevelUrl', () => {
  it('starts a unit at its first level', () => {
    expect(firstLevelUrl(oceans)).toBe(
      'https://studio.code.org/courses/oceans/units/1/lessons/1/levels/1',
    );
  });

  it('keeps a URL that already opens a level', () => {
    for (const curriculum of CURRICULA) {
      if (!/\/units\/\d+$/.test(curriculum.url)) {
        expect(firstLevelUrl(curriculum)).toBe(curriculum.url);
      }
    }
  });
});
