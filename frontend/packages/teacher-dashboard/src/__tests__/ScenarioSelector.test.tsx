// TDF-SHELL-02: the selector lists the sections scenario tags registered in
// core's mock registry (F0-T12: `getRegisteredFixtureTags`, not a hand-kept
// local list) and reports the chosen tag via onChange. Tags without a label
// entry in `mocks/scenarios.ts` render using the tag string itself.

import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {axe} from 'vitest-axe';

import {
  clearMockFixtures,
  registerMockFixture,
} from '@code-dot-org/core/api/mocks';

import {
  SECTIONS_SCENARIO_LABELS,
  TEACHER_DASHBOARD_LAB_KEY,
} from '../mocks/scenarios';
import ScenarioSelector from '../ScenarioSelector';

const REGISTERED_TAGS = Object.keys(SECTIONS_SCENARIO_LABELS);

describe('ScenarioSelector (TDF-SHELL-02)', () => {
  it('lists every registered scenario tag as an option', () => {
    render(<ScenarioSelector value={REGISTERED_TAGS[0]} onChange={vi.fn()} />);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(REGISTERED_TAGS.length);
    REGISTERED_TAGS.forEach(tag => {
      expect(
        screen.getByRole('option', {name: SECTIONS_SCENARIO_LABELS[tag]}),
      ).toBeInTheDocument();
    });
  });

  it('calls onChange with the selected tag', () => {
    const onChange = vi.fn();
    render(<ScenarioSelector value="sections-empty" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: {value: 'sections-one'},
    });
    expect(onChange).toHaveBeenCalledWith('sections-one');
  });

  it('has no axe violations', async () => {
    const {container} = render(
      <ScenarioSelector value="sections-empty" onChange={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('a registry tag with no label entry (F0-T12)', () => {
    const UNLABELED_TAG = 'sections-unlabeled-test';

    afterEach(() => {
      clearMockFixtures({
        labKey: TEACHER_DASHBOARD_LAB_KEY,
        tag: UNLABELED_TAG,
      });
    });

    it('renders using the tag string as a fallback label', () => {
      registerMockFixture(
        {labKey: TEACHER_DASHBOARD_LAB_KEY, tag: UNLABELED_TAG},
        {path: '*/api/unlabeled-scenario-test', respond: {}},
      );

      render(<ScenarioSelector value={UNLABELED_TAG} onChange={vi.fn()} />);

      expect(
        screen.getByRole('option', {name: UNLABELED_TAG}),
      ).toBeInTheDocument();
    });
  });
});
