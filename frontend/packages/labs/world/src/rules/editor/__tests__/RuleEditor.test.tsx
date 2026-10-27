// The Rule Editor (specs/RULE_EDITOR_PLAN.md, step 2).

import {fireEvent, render, screen, within} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {ruleView, type RuleData} from '../../ruleData';
import {resolveRuleContents} from '../../ruleReference';

// The starter's project, whose Gravity is the library's, held by reference.
const SOURCE: MultiFileSource = WORLD_SCENARIOS.simple.source;
const GRAVITY = Object.values(SOURCE.files).find(
  file => file.name === 'gravity.rule',
)!;

const replaceSources = vi.fn();
/** The confirm dialog: answered yes. */
const showDialog = vi.fn(async () => ({type: 'confirm', args: ''}));
vi.mock('@code-dot-org/lab/contexts', () => ({
  useSources: () => ({currentSources: {source: SOURCE}, replaceSources}),
  useDialogControl: () => ({showDialog}),
  useMaybeLevelProperties: () => undefined,
}));
// A member's picture is a Blockly workspace, which jsdom cannot lay out.
vi.mock('../../../actors/editor/MemberPicture', () => ({
  MemberPicture: ({label}: {label: string}) => (
    <span role="img" aria-label={label} />
  ),
}));
// The code is the file editor over the rule's view; what it is handed and
// what it saves are what is asked about here.
const blocks: {
  onChange?: (contents: string) => void;
  contents?: string;
} = {};
vi.mock('../../../blockly/BlocklyFileEditor', () => ({
  BlocklyFileEditor: (props: {
    initialContents: string;
    onChange: (contents: string) => void;
  }) => {
    blocks.onChange = props.onChange;
    blocks.contents = props.initialContents;
    return <div data-testid="blocks" />;
  },
}));

const {RuleFileEditor} = await import('../RuleEditor');

const onChange = vi.fn();
beforeEach(() => {
  onChange.mockClear();
  replaceSources.mockClear();
});

const open = (contents = GRAVITY.contents) =>
  render(
    <RuleFileEditor
      fileId={GRAVITY.id}
      initialContents={contents}
      language="rule"
      isReadOnly={false}
      onChange={onChange}
    />,
  );

const written = () => JSON.parse(onChange.mock.calls.at(-1)![0] as string);

describe('the Rule Editor', () => {
  it('opens a rule as data, its traits in the panel', () => {
    open();
    expect(screen.getByTestId('rule-editor')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: 'Rule: Gravity'}),
    ).toBeInTheDocument();
    const panel = screen.getByRole('region', {name: 'Properties and traits'});
    expect(
      within(panel).getByRole('button', {name: 'Affected by Gravity'}),
    ).toBeInTheDocument();
    expect(
      within(panel).getByRole('button', {name: 'Acts as Ground'}),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('blocks')).toBeNull();
  });

  it('writes a default as data, the reference becoming the learner’s', () => {
    open();
    const field = screen.getByRole('spinbutton', {
      name: 'Amount of gravity (number)',
    });
    fireEvent.change(field, {target: {value: '12'}});
    fireEvent.blur(field);

    const data = written();
    expect(data.type).toBe('rule');
    expect(
      data.properties.find(
        (one: {name: string}) => one.name === 'amount of gravity',
      ).value,
    ).toBe('12');
  });

  it('says a property is the rule’s alone to set', () => {
    open();
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Only this rule sets direction of gravity',
      }),
    );
    expect(written().properties[0].access).toBe('readonly');
  });

  it('adds a property to a trait', () => {
    open();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add a property to Affected by Gravity',
      }),
    );
    const form = screen.getByRole('group', {
      name: 'New property for Affected by Gravity',
    });
    fireEvent.change(within(form).getByLabelText('Name'), {
      target: {value: 'bounce'},
    });
    fireEvent.click(within(form).getByRole('button', {name: 'Add'}));

    const trait = written().traits.find(
      (one: {name: string}) => one.name === 'Affected by Gravity',
    );
    expect(trait.properties.at(-1)).toEqual({
      name: 'bounce',
      type: 'number',
      access: 'writable',
      value: '0',
    });
  });

  it('opens a trait with focus on it, and goes back to its name', () => {
    open();
    const name = screen.getByRole('button', {name: 'Affected by Gravity'});
    fireEvent.click(name);

    const heading = screen.getByRole('heading', {
      name: 'Trait: Affected by Gravity',
    });
    expect(document.activeElement).toBe(heading);
    expect(name).toHaveAttribute('aria-current', 'true');
    const needs = screen.getByRole('region', {name: 'Traits it needs'});
    expect(within(needs).getByText('Can Move')).toBeInTheDocument();
    const steps = screen.getByRole('region', {name: 'Steps'});
    expect(
      within(steps).getByText('applyVelocity, during push'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Gravity'}));
    expect(document.activeElement).toBe(name);
  });

  it('adds a rule it uses, and takes one away', () => {
    open();
    const uses = screen.getByRole('region', {name: 'Rules it uses'});
    fireEvent.click(
      within(uses).getByRole('button', {name: 'Stop using Solid Bodies'}),
    );
    expect(written().uses).not.toContain('Solid Bodies');
  });

  it('says so of a rule the data cannot say, and never opens it in blocks', () => {
    const view = ruleView(
      JSON.parse(resolveRuleContents(GRAVITY.contents)) as RuleData,
    ) as {blocks: {blocks: unknown[]}};
    view.blocks.blocks.push({type: 'world_print'});
    open(JSON.stringify(view));
    expect(screen.getByText(/cannot be read/)).toBeInTheDocument();
    expect(screen.queryByTestId('blocks')).toBeNull();
    expect(screen.queryByRole('button', {name: 'Code'})).toBeNull();
  });
});

const traitOf = (data: {
  traits: Array<{
    name: string;
    members?: unknown[];
    steps: Array<{name: string; phase?: string}>;
  }>;
}) => data.traits.find(one => one.name === 'Affected by Gravity')!;

describe('a rule’s member', () => {
  it('opens on its page from its trait, and says what it reports', () => {
    open();
    fireEvent.click(
      screen.getByRole('button', {name: /^Affected by Gravity$/}),
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit is on the ground?, reports a boolean',
      }),
    );

    expect(
      screen.getByRole('heading', {name: 'Block: is on the ground?'}),
    ).toBeInTheDocument();
    const reports = screen.getByLabelText('Reports') as HTMLSelectElement;
    expect(reports.value).toBe('boolean');
    fireEvent.change(reports, {target: {value: 'number'}});

    const block = (
      traitOf(written()).members as Array<{kind: string; returns?: string}>
    ).find(one => one.kind === 'block')!;
    expect(block.returns).toBe('number');
  });

  it('is made in the definition it is made from', () => {
    open();
    fireEvent.click(
      screen.getByRole('button', {name: /^Affected by Gravity$/}),
    );
    const events = screen.getByRole('region', {name: 'Events'});
    fireEvent.click(within(events).getByRole('button', {name: 'New event'}));

    const members = traitOf(written()).members as Array<{
      kind: string;
      parts: Array<{text?: string}>;
    }>;
    expect(members.at(-1)).toMatchObject({
      kind: 'event',
      parts: [{text: 'happens'}],
    });
    expect(written().members).toHaveLength(4);
    expect(
      screen.getByRole('heading', {name: 'Event: happens'}),
    ).toBeInTheDocument();
  });

  it('is deleted once the question is answered', async () => {
    open();
    fireEvent.click(
      screen.getByRole('button', {name: 'Delete Invert Gravity'}),
    );
    await vi.waitFor(() =>
      expect(
        written().members.map((one: {parts: Array<{text?: string}>}) =>
          one.parts.map(part => part.text).join(' '),
        ),
      ).not.toContain('Invert Gravity'),
    );
  });
});

describe('a rule’s step', () => {
  const openTrait = () =>
    fireEvent.click(
      screen.getByRole('button', {name: /^Affected by Gravity$/}),
    );

  it('opens on its page, its head saying when it runs', () => {
    open();
    openTrait();
    fireEvent.click(
      screen.getByRole('button', {name: 'Edit applyVelocity, during push'}),
    );

    const heading = screen.getByRole('heading', {name: 'Step: applyVelocity'});
    expect(document.activeElement).toBe(heading);
    const head = JSON.parse(blocks.contents!).blocks.blocks[0];
    expect(head).toMatchObject({
      type: 'world_step_head',
      fields: {
        MOMENT:
          'each frame, during push, for each actor with Affected by Gravity',
      },
    });
    expect(head.next.block).toBeDefined();
  });

  it('is renamed and given another moment', () => {
    open();
    openTrait();
    fireEvent.click(
      screen.getByRole('button', {name: 'Edit applyVelocity, during push'}),
    );
    const name = screen.getByLabelText('Name');
    fireEvent.change(name, {target: {value: 'fall'}});
    fireEvent.blur(name);
    expect(traitOf(written()).steps[0].name).toBe('fall');

    fireEvent.change(screen.getByLabelText('Runs'), {
      target: {value: 'move'},
    });
    expect(traitOf(written()).steps[0].phase).toBe('move');
  });

  it('is made under its trait', () => {
    open();
    openTrait();
    const steps = screen.getByRole('region', {name: 'Steps'});
    fireEvent.click(within(steps).getByRole('button', {name: 'New step'}));
    expect(traitOf(written()).steps.at(-1)).toEqual({
      name: 'do something',
      phase: 'decide',
    });
    expect(
      screen.getByRole('heading', {name: 'Step: do something'}),
    ).toBeInTheDocument();
  });

  it('is deleted, what it does with it', async () => {
    open();
    openTrait();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Delete handleCollisions, during react',
      }),
    );
    await vi.waitFor(() =>
      expect(
        traitOf(written()).steps.map((one: {name: string}) => one.name),
      ).toEqual(['applyVelocity']),
    );
  });
});

describe('a rule’s trait', () => {
  const openTrait = () =>
    fireEvent.click(screen.getByRole('button', {name: /^Acts as Ground$/}));

  it('is renamed across the project, and stays open under its new name', () => {
    open();
    openTrait();
    fireEvent.click(
      screen.getByRole('button', {name: 'Rename Acts as Ground'}),
    );
    const form = screen.getByRole('group', {name: 'Rename Acts as Ground'});
    fireEvent.change(within(form).getByLabelText('Name'), {
      target: {value: 'Holds Things Up'},
    });
    fireEvent.click(within(form).getByRole('button', {name: 'Save name'}));

    const source = replaceSources.mock.calls.at(-1)![0]
      .source as MultiFileSource;
    expect(source.files[GRAVITY.id].contents).toContain('Holds Things Up');
  });

  it('is deleted once asked, focus going back to the rule', async () => {
    open();
    openTrait();
    fireEvent.click(
      screen.getByRole('button', {name: 'Delete Acts as Ground'}),
    );
    await vi.waitFor(() =>
      expect(written().traits.map((one: {name: string}) => one.name)).toEqual([
        'Affected by Gravity',
      ]),
    );
    expect(document.activeElement).toBe(
      screen.getByRole('button', {name: 'Gravity'}),
    );
  });
});
