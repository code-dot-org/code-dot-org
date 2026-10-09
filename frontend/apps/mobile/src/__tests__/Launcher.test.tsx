import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, it, expect, vi} from 'vitest';

import {CURRICULA, type Curriculum} from '../curricula';
import Launcher from '../Launcher';

const curriculum: Curriculum = {
  id: 'test-curriculum',
  title: 'Test Curriculum',
  description: 'A short description.',
  image: {src: 'https://images.code.org/test.png', fit: 'cover'},
  topics: ['Artificial Intelligence', 'Music', 'Programming'],
  grades: '3-12',
  duration: 'Lesson',
  url: 'https://studio.code.org/courses/test/units/1/lessons/1/levels/1',
};

describe('Launcher', () => {
  it('shows each curriculum as a catalog card', () => {
    render(<Launcher curricula={[curriculum]} onOpen={vi.fn()} />);
    expect(
      screen.getByRole('heading', {level: 1, name: 'CodeAI'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: 'Test Curriculum'}),
    ).toBeInTheDocument();
    expect(screen.getByText('A short description.')).toBeInTheDocument();
    expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getByText('Grades: 3-12')).toBeInTheDocument();
    expect(screen.getByText('Duration: Lesson')).toBeInTheDocument();
  });

  it('says Grade for a single grade and omits a missing duration', () => {
    render(
      <Launcher
        curricula={[{...curriculum, grades: '5', duration: undefined}]}
        onOpen={vi.fn()}
      />,
    );
    expect(screen.getByText('Grade: 5')).toBeInTheDocument();
    expect(screen.queryByText(/Duration/)).not.toBeInTheDocument();
  });

  it('opens the curriculum from Try Now', async () => {
    const onOpen = vi.fn();
    render(<Launcher curricula={[curriculum]} onOpen={onOpen} />);
    await userEvent.click(
      screen.getByRole('button', {name: 'Try Test Curriculum now'}),
    );
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(curriculum);
  });

  it('gives each card one interactive element', () => {
    render(
      <Launcher
        curricula={[curriculum, {...curriculum, id: 'b'}]}
        onOpen={vi.fn()}
      />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});

describe('CURRICULA', () => {
  it('lists the 22 Content Library curricula once each', () => {
    expect(CURRICULA).toHaveLength(22);
    expect(new Set(CURRICULA.map(a => a.id)).size).toBe(22);
  });

  it('loads every curriculum from studio.code.org over https', () => {
    for (const {url} of CURRICULA) {
      expect(new URL(url).origin).toBe('https://studio.code.org');
    }
  });

  it('gives every card a title, description, image, topic and grades', () => {
    for (const a of CURRICULA) {
      expect(a.title).not.toBe('');
      expect(a.description).not.toBe('');
      expect(a.image.src).not.toBe('');
      expect(a.topics.length).toBeGreaterThan(0);
      expect(a.grades).toMatch(/^(K|\d+)(-\d+)?$/);
    }
  });
});
