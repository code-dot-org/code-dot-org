import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, it, expect, vi} from 'vitest';

import {
  CURRICULA,
  curriculumForCourse,
  firstLevelUrl,
} from '@/config/curricula';

import Congratulations from '../Congratulations';

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
    expect(
      within(screen.getByRole('main')).getAllByRole('button'),
    ).toHaveLength(1);
  });
});

describe('curriculumForCourse', () => {
  it('matches the course in each kind of curriculum URL', () => {
    expect(curriculumForCourse('oceans')?.id).toBe('oceans');
    expect(curriculumForCourse('frozen')?.id).toBe('frozen');
    expect(curriculumForCourse('flappy')?.id).toBe('flappy');
  });

  it('is undefined for unknown, shared or free-play courses', () => {
    expect(curriculumForCourse('')).toBeUndefined();
    expect(curriculumForCourse('hourofcode')).toBeUndefined();
    expect(curriculumForCourse('projects')).toBeUndefined();
    const lessonOf = (id: string, lesson: number) => ({
      ...oceans,
      id,
      url: `https://studio.code.org/courses/coursed-2025/units/1/lessons/${lesson}/levels/1`,
    });
    expect(
      curriculumForCourse('coursed-2025', [
        lessonOf('a', 8),
        lessonOf('b', 11),
      ]),
    ).toBeUndefined();
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
