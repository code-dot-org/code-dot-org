import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import postcss, {Rule} from 'postcss';
import {useState} from 'react';
import {vi} from 'vitest';

import {MuiChips, MuiChipsProps} from './../index';

const options = [
  {value: 'chip1', label: 'Chip1'},
  {value: 'chip2', label: 'Chip2'},
  {value: 'chip3', label: 'Chip3'},
];

const REQUIRED_WARNING =
  'For usages of the Chips component where the "required" prop is set to true, a localized error message to display when no option is selected is needed.';

const getInput = (label: string) =>
  screen.getByLabelText(label) as HTMLInputElement;

describe('Design System - MuiChips', () => {
  const TestChips: React.FC<Partial<MuiChipsProps>> = props => {
    const [values, setValues] = useState<string[]>(props.values || []);

    return (
      <MuiChips
        name="test-chips"
        values={values}
        setValues={setValues}
        options={options}
        {...props}
      />
    );
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with correct label', () => {
    render(<TestChips label="Chips label" />);

    expect(screen.getByText('Chips label')).toBeInTheDocument();
    options.forEach(({label}) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  });

  it('does not render label if it is not specified', () => {
    render(<TestChips />);

    expect(screen.queryByText('Chips label')).not.toBeInTheDocument();
    options.forEach(({label}) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  });

  it('checks chip on click', async () => {
    const user = userEvent.setup();

    render(<TestChips label="Chips label" />);

    const chip1 = getInput('Chip1');
    const chip2 = getInput('Chip2');
    const chip3 = getInput('Chip3');

    expect(chip1.checked).toBe(false);
    expect(chip2.checked).toBe(false);
    expect(chip3.checked).toBe(false);

    await user.click(chip1);

    expect(chip1.checked).toBe(true);
    expect(chip2.checked).toBe(false);
    expect(chip3.checked).toBe(false);

    await user.click(chip2);

    expect(chip1.checked).toBe(true);
    expect(chip2.checked).toBe(true);
    expect(chip3.checked).toBe(false);

    await user.click(chip1);

    expect(chip1.checked).toBe(false);
    expect(chip2.checked).toBe(true);
    expect(chip3.checked).toBe(false);
  });

  it('handles required state correctly', async () => {
    const user = userEvent.setup();

    render(
      <TestChips
        label="Chips label"
        required
        requiredMessageText="Please choose at least one option"
      />,
    );

    const chip1 = getInput('Chip1');
    const chip2 = getInput('Chip2');

    expect(chip1.required).toBe(true);
    expect(chip2.required).toBe(true);

    await user.click(chip1);

    expect(chip1.required).toBe(false);
    expect(chip2.required).toBe(false);

    await user.click(chip1);

    expect(chip1.required).toBe(true);
    expect(chip2.required).toBe(true);
  });

  it('does not require any chip when required is not set', () => {
    render(<TestChips />);

    options.forEach(({label}) => expect(getInput(label).required).toBe(false));
  });

  it('does not check chip if disabled', async () => {
    const user = userEvent.setup();

    render(<TestChips label="Chips label" disabled />);

    const chip1 = getInput('Chip1');
    const chip2 = getInput('Chip2');

    expect(chip1.disabled).toBe(true);
    expect(chip2.disabled).toBe(true);

    await user.click(chip1);

    expect(chip1.checked).toBe(false);

    await user.click(chip2);

    expect(chip2.checked).toBe(false);
  });

  it('disables the inputs, not the MUI Chip', () => {
    render(<TestChips disabled />);

    options.forEach(({label}) => {
      const input = getInput(label);
      expect(input).toBeDisabled();
      const root = input.closest('label') as HTMLElement;
      expect(root).toHaveClass('MuiChip-root');
      expect(root).not.toHaveClass('Mui-disabled');
    });
  });

  describe('form contract', () => {
    it('renders each option as a named checkbox inside a <label> MUI Chip', () => {
      render(<TestChips />);

      options.forEach(({value, label}) => {
        const input = getInput(label);
        expect(input).toHaveAttribute('type', 'checkbox');
        expect(input).toHaveAttribute('name', 'test-chips[]');
        expect(input).toHaveAttribute('value', value);
        const root = input.closest('label') as HTMLElement;
        expect(root).toHaveClass('MuiChip-root', 'MuiChip-outlined', 'chip');
        expect(input.parentElement).toHaveClass('MuiChip-label', 'chipLabel');
        expect(root.parentElement?.tagName).toBe('DIV');
      });
    });

    it('renders the chips in an MUI FormGroup row inside the fieldset', () => {
      render(<TestChips label="Chips label" />);

      const fieldset = screen.getByRole('group');
      const row = fieldset.querySelector('.chipsContainer') as HTMLElement;
      expect(row).toHaveClass('MuiFormGroup-root', 'MuiFormGroup-row');
      expect(row.parentElement).toBe(fieldset);
      expect(fieldset.firstElementChild?.tagName).toBe('LABEL');
      expect(fieldset.firstElementChild).toHaveClass('groupLabel');
      expect(within(row).getAllByRole('checkbox')).toHaveLength(3);
    });

    it('puts data-testid and className on the root div', () => {
      render(<TestChips className="custom-chips" />);

      const root = screen.getByTestId('chips-test-chips');
      expect(root.tagName).toBe('DIV');
      expect(root).toHaveClass('chips', 'chips-black', 'chips-m');
      expect(root.className.endsWith('custom-chips')).toBe(true);
      expect(root.firstElementChild?.tagName).toBe('FIELDSET');
    });

    it('posts name[] for each checked value', async () => {
      const user = userEvent.setup();
      render(
        <form data-testid="form">
          <TestChips />
        </form>,
      );

      await user.click(getInput('Chip3'));
      await user.click(getInput('Chip1'));

      const form = screen.getByTestId('form') as HTMLFormElement;
      expect(new FormData(form).getAll('test-chips[]')).toEqual([
        'chip1',
        'chip3',
      ]);
    });

    it('blocks an empty submit with the custom message, and stops once a chip is checked', async () => {
      const user = userEvent.setup();
      render(
        <form data-testid="form">
          <TestChips required requiredMessageText="Pick a grade" />
        </form>,
      );
      const form = screen.getByTestId('form') as HTMLFormElement;

      expect(form.checkValidity()).toBe(false);
      options.forEach(({label}) =>
        expect(getInput(label).validationMessage).toBe('Pick a grade'),
      );

      await user.click(getInput('Chip2'));

      expect(form.checkValidity()).toBe(true);
      options.forEach(({label}) => {
        expect(getInput(label).required).toBe(false);
        expect(getInput(label).validationMessage).toBe('');
      });
    });

    it('falls back to the English message when requiredMessageText is missing', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <form data-testid="form">
          <TestChips required />
        </form>,
      );

      expect(
        (screen.getByTestId('form') as HTMLFormElement).checkValidity(),
      ).toBe(false);
      expect(getInput('Chip1').validationMessage).toBe(
        'Please choose at least one option',
      );
    });

    it('clears the custom message on change', async () => {
      const user = userEvent.setup();
      // A setValues that never updates state, so no re-render runs the reset effect.
      render(
        <MuiChips
          name="test-chips"
          values={[]}
          setValues={vi.fn()}
          options={options}
          required
          requiredMessageText="Pick a grade"
        />,
      );
      const chip1 = getInput('Chip1');

      chip1.checkValidity();
      expect(chip1.validity.customError).toBe(true);

      await user.click(chip1);

      expect(chip1.validity.customError).toBe(false);
    });

    it('clears the custom message when required turns off without a click', () => {
      const {rerender} = render(
        <TestChips required requiredMessageText="Pick a grade" />,
      );
      const chip1 = getInput('Chip1');

      chip1.checkValidity();
      expect(chip1.validity.customError).toBe(true);

      rerender(
        <TestChips required={false} requiredMessageText="Pick a grade" />,
      );

      expect(chip1.validity.customError).toBe(false);
      expect(chip1.checkValidity()).toBe(true);
    });
  });

  describe('setValues', () => {
    it('appends a checked value and filters an unchecked one', async () => {
      const user = userEvent.setup();
      const setValues = vi.fn();
      const {rerender} = render(
        <MuiChips
          name="test-chips"
          options={options}
          values={['chip3']}
          setValues={setValues}
        />,
      );

      await user.click(getInput('Chip1'));
      expect(setValues).toHaveBeenLastCalledWith(['chip3', 'chip1']);

      rerender(
        <MuiChips
          name="test-chips"
          options={options}
          values={['chip3', 'chip1']}
          setValues={setValues}
        />,
      );
      await user.click(getInput('Chip3'));
      expect(setValues).toHaveBeenLastCalledWith(['chip1']);
    });

    it('checks the inputs listed in values', () => {
      render(
        <MuiChips
          name="test-chips"
          options={options}
          values={['chip2']}
          setValues={() => {}}
        />,
      );

      expect(getInput('Chip1').checked).toBe(false);
      expect(getInput('Chip2').checked).toBe(true);
      expect(getInput('Chip3').checked).toBe(false);
    });
  });

  describe('keyboard and roles', () => {
    it('has no button role and no tabindex', () => {
      render(<TestChips label="Chips label" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(document.querySelector('[tabindex]')).toBeNull();
    });

    it('tabs from input to input and toggles with Space', async () => {
      const user = userEvent.setup();
      render(<TestChips label="Chips label" />);

      await user.tab();
      expect(getInput('Chip1')).toHaveFocus();
      await user.tab();
      expect(getInput('Chip2')).toHaveFocus();
      await user.tab();
      expect(getInput('Chip3')).toHaveFocus();
      await user.tab();
      expect(document.body).toHaveFocus();

      await user.tab({shift: true});
      expect(getInput('Chip3')).toHaveFocus();
      await user.keyboard(' ');
      expect(getInput('Chip3').checked).toBe(true);
      await user.keyboard(' ');
      expect(getInput('Chip3').checked).toBe(false);
    });

    it('names each checkbox by its chip', () => {
      render(<TestChips />);

      expect(
        screen.getAllByRole('checkbox').map(input => input.closest('label')),
      ).toEqual(
        options.map(({label}) => screen.getByLabelText(label).closest('label')),
      );
      options.forEach(({label}) =>
        expect(screen.getByRole('checkbox', {name: label})).toBeInTheDocument(),
      );
    });
  });

  describe('group name', () => {
    it('names the fieldset with the heading', () => {
      render(<TestChips label="Chips label" />);

      const group = screen.getByRole('group', {name: 'Chips label'});
      expect(group.tagName).toBe('FIELDSET');
      const heading = screen.getByText('Chips label');
      expect(heading.tagName).toBe('LABEL');
      expect(group).toHaveAttribute('aria-labelledby', heading.id);
    });

    it('gives each group its own heading id', () => {
      render(
        <>
          <TestChips name="first" label="First" />
          <TestChips name="second" label="Second" />
        </>,
      );

      expect(screen.getByText('First').id).not.toBe(
        screen.getByText('Second').id,
      );
      expect(screen.getByRole('group', {name: 'Second'})).toBe(
        screen.getByTestId('chips-second').querySelector('fieldset'),
      );
    });

    it('leaves the fieldset unnamed without a label', () => {
      render(<TestChips />);

      expect(screen.getByRole('group')).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('style props', () => {
    it('maps size and color onto the root div', () => {
      render(<TestChips size="xs" color="gray" />);

      expect(screen.getByTestId('chips-test-chips')).toHaveClass(
        'chips-xs',
        'chips-gray',
      );
    });

    it('maps textThickness onto each chip, thin by default', () => {
      const {unmount} = render(<TestChips />);
      expect(getInput('Chip1').closest('label')).toHaveClass('chip-thin');
      unmount();

      render(<TestChips textThickness="thick" />);
      expect(getInput('Chip1').closest('label')).toHaveClass('chip-thick');
    });

    it('keeps MUI Chip size and color at their defaults', () => {
      render(<TestChips size="l" color="gray" />);

      expect(getInput('Chip1').closest('label')).toHaveClass(
        'MuiChip-sizeMedium',
        'MuiChip-colorDefault',
      );
    });
  });

  describe('console.warn', () => {
    it('warns when required has no message', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<TestChips required />);

      expect(warn).toHaveBeenCalledWith(REQUIRED_WARNING);
    });

    it('does not warn when required has a message', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<TestChips required requiredMessageText="Pick one" />);

      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe('global side effects', () => {
    it('renders in place and leaves body untouched', async () => {
      const user = userEvent.setup();
      const bodyAttributes = [...document.body.attributes].map(a => a.name);
      const bodyStyle = document.body.getAttribute('style');
      const {container} = render(<TestChips label="Chips label" />);

      expect(container.firstElementChild).toBe(
        screen.getByTestId('chips-test-chips'),
      );
      expect(document.body.children).toHaveLength(1);

      await user.click(getInput('Chip1'));
      await user.keyboard(' ');

      expect([...document.body.attributes].map(a => a.name)).toEqual(
        bodyAttributes,
      );
      expect(document.body.getAttribute('style')).toBe(bodyStyle);
    });
  });
});

// jsdom applies no stylesheet cascade, so these read muiChips.module.scss itself.
describe('muiChips.module.scss', () => {
  const source = readFileSync(
    path.join(__dirname, '../muiChips.module.scss'),
    'utf8',
  ).replace(/^\s*\/\/.*$/gm, '');
  const rules: {selector: string; decls: Record<string, string>}[] = [];
  const resolve = (rule: Rule): string[] => {
    const parents =
      rule.parent?.type === 'rule' ? resolve(rule.parent as Rule) : [''];
    return parents.flatMap(parent =>
      rule.selectors.map(selector =>
        selector.includes('&')
          ? selector.replaceAll('&', parent)
          : `${parent} ${selector}`.trim(),
      ),
    );
  };
  postcss.parse(source).walkRules(rule => {
    const decls: Record<string, string> = {};
    rule.each(node => {
      if (node.type === 'decl') decls[node.prop] = node.value;
    });
    resolve(rule).forEach(selector => rules.push({selector, decls}));
  });
  const declsOf = (selector: string) =>
    rules.find(rule => rule.selector === selector)?.decls;

  // The last compound selector: what the rule styles.
  const subjectOf = (selector: string) => {
    let depth = 0;
    let start = 0;
    [...selector].forEach((char, i) => {
      if ('(['.includes(char)) depth++;
      if (')]'.includes(char)) depth--;
      if (depth === 0 && ' >+~'.includes(char)) start = i + 1;
    });
    return selector.slice(start);
  };

  it('gives every rule that styles an MUI slot two classes or more', () => {
    const muiSlotRules = rules.filter(
      ({selector, decls}) =>
        Object.keys(decls).length > 0 &&
        /\.(chip|chipLabel|chipsContainer)(?![\w-])/.test(subjectOf(selector)),
    );

    expect(muiSlotRules.length).toBeGreaterThan(10);
    expect(
      muiSlotRules
        .map(({selector}) => selector)
        .filter(
          selector => (selector.match(/\.[A-Za-z_][\w-]*/g) ?? []).length < 2,
        ),
    ).toEqual([]);
  });

  it('cancels the MUI Chip root styles legacy never set', () => {
    expect(declsOf('.chips fieldset .chip')).toMatchObject({
      display: 'inline-block',
      height: 'auto',
      'vertical-align': 'baseline',
      transition: 'none',
    });
  });

  it('cancels the MUI label slot padding, overflow and nowrap', () => {
    expect(declsOf('.chips fieldset .chipLabel')).toEqual({
      padding: '0',
      overflow: 'visible',
      'text-overflow': 'clip',
      'white-space': 'normal',
      'overflow-wrap': 'anywhere',
    });
  });

  it('lets a chip wrap instead of overflowing its row', () => {
    expect(declsOf('.chips fieldset .chip')).toMatchObject({
      'white-space': 'normal',
      'overflow-wrap': 'anywhere',
    });
    expect(source).not.toMatch(/white-space:\s*nowrap/);
  });

  it('fills a checked chip and rings a focused one', () => {
    expect(
      declsOf(".chips fieldset .chip:has(input[type='checkbox']:checked)"),
    ).toEqual({
      border: '1px solid var(--borders-brand-teal-primary)',
      'background-color': 'var(--background-brand-teal-primary)',
      color: 'var(--text-neutral-white-fixed)',
    });
    expect(
      declsOf(
        ".chips fieldset .chip:has(input[type='checkbox']:focus-visible)",
      ),
    ).toEqual({
      outline: '2px solid var(--borders-brand-teal-primary)',
      'outline-offset': '2px',
    });
  });

  it('ports the codeai-next brand block', () => {
    expect(
      declsOf(
        "[data-brand='codeai-next'] .chips fieldset .chip:has(input[type='checkbox']:checked)",
      ),
    ).toEqual({
      'border-color': 'var(--border-selected-primary)',
      'background-color': 'var(--background-selected-primary)',
      color: 'var(--text-selected-primary)',
    });
  });
});
