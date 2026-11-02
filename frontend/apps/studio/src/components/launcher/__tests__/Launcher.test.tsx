import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, it, expect, vi} from 'vitest';

import {CURRICULA, launchUrl, type Curriculum} from '@/config/curricula';

import Launcher from '../Launcher';

const curriculum: Curriculum = {
  id: 'test-curriculum',
  title: 'Test Curriculum',
  image: {src: 'https://images.code.org/test.png', fit: 'cover'},
  category: 'Hour of AI',
  ages: '7-11',
  url: 'https://studio.code.org/courses/test/units/1/lessons/1/levels/1',
};

describe('Launcher', () => {
  it('shows each curriculum as card with category and ages', () => {
    render(<Launcher curricula={[curriculum]} onOpen={vi.fn()} />);
    expect(
      screen.getByRole('heading', {level: 1, name: 'CodeAI'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: 'Test Curriculum'}),
    ).toBeInTheDocument();
    expect(screen.getByText('Hour of AI')).toBeInTheDocument();
    expect(screen.getByText('Ages 7-11')).toBeInTheDocument();
  });

  it('copies the privacy policy address rather than linking to it', async () => {
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText},
    });
    render(<Launcher curricula={[curriculum]} onOpen={vi.fn()} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', {name: /Copy the privacy policy address/}),
    );
    expect(writeText).toHaveBeenCalledWith('https://code.org/privacy');
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Copied!');
  });

  it('opens the curriculum from Try Now', async () => {
    const onOpen = vi.fn();
    render(<Launcher curricula={[curriculum]} onOpen={onOpen} />);
    await userEvent.click(
      screen.getByRole('button', {name: 'Try Now: Test Curriculum'}),
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
    expect(
      within(screen.getByRole('main')).getAllByRole('button'),
    ).toHaveLength(2);
  });
});

describe('CURRICULA', () => {
  it('lists the 10 Content Library curricula once each', () => {
    expect(CURRICULA).toHaveLength(10);
    expect(new Set(CURRICULA.map(a => a.id)).size).toBe(10);
  });

  it('loads every curriculum from studio.code.org over https', () => {
    for (const {url} of CURRICULA) {
      expect(new URL(url).origin).toBe('https://studio.code.org');
    }
  });

  it('gives every card title, image and age range', () => {
    for (const a of CURRICULA) {
      expect(a.title).not.toBe('');
      expect(a.image.src).not.toBe('');
      expect(a.ages).toMatch(/^\d+-\d+$/);
    }
  });

  it('asks level-start curricula to resume at next unpassed level', () => {
    const byId = (id: string) => CURRICULA.find(c => c.id === id)!;
    expect(launchUrl(byId('flappy'))).toBe(
      'https://studio.code.org/flappy/1?codeai_resume=1',
    );
    expect(launchUrl(byId('frozen'))).toBe(
      'https://studio.code.org/courses/frozen/units/1/lessons/1/levels/1?codeai_resume=1',
    );
    expect(launchUrl(byId('oceans'))).toBe(
      'https://studio.code.org/courses/oceans/units/1',
    );
    expect(launchUrl(byId('spritelab'))).toBe(
      'https://studio.code.org/projects/spritelab',
    );
  });
});
