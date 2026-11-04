import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {vi} from 'vitest';

import {MuiAccordion, MuiAccordionProps} from './../index';

const mockAccordionItems: MuiAccordionProps['items'] = [
  {
    id: 'first',
    label: 'First Accordion',
    content: 'This is the first accordion content.',
  },
  {
    id: 'second',
    label: 'Second Accordion',
    content: 'This is the second accordion content.',
  },
  {
    id: 'third',
    label: 'Third Accordion',
    content: 'This is the third accordion content.',
  },
];

const getSummary = (name: string) => screen.getByRole('button', {name});

describe('MuiAccordion Component', () => {
  it('renders all accordion items', () => {
    render(<MuiAccordion items={mockAccordionItems} />);

    mockAccordionItems.forEach(({label}) => {
      expect(screen.getByText(`${label}`)).toBeVisible();
    });
  });

  it('should not show content initially', () => {
    render(<MuiAccordion items={mockAccordionItems} />);

    mockAccordionItems.forEach(({content}) => {
      expect(screen.getByText(`${content}`)).toBeInTheDocument();
      expect(screen.getByText(`${content}`)).not.toBeVisible();
    });
  });

  it('should expand and collapse the accordion items', async () => {
    render(<MuiAccordion items={mockAccordionItems} />);

    const firstAccordion = screen.getByText('First Accordion');
    expect(
      screen.getByText('This is the first accordion content.'),
    ).not.toBeVisible();

    fireEvent.click(firstAccordion);
    expect(
      screen.getByText('This is the first accordion content.'),
    ).toBeVisible();

    fireEvent.click(firstAccordion);
    await waitFor(() =>
      expect(
        screen.getByText('This is the first accordion content.'),
      ).not.toBeVisible(),
    );
  });

  it('should allow multiple accordions to be opened separately', () => {
    render(<MuiAccordion items={mockAccordionItems} />);

    fireEvent.click(screen.getByText('First Accordion'));
    expect(
      screen.getByText('This is the first accordion content.'),
    ).toBeVisible();

    fireEvent.click(screen.getByText('Second Accordion'));
    expect(
      screen.getByText('This is the second accordion content.'),
    ).toBeVisible();
    expect(
      screen.getByText('This is the first accordion content.'),
    ).toBeVisible();
    expect(getSummary('First Accordion')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(getSummary('Third Accordion')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('should render rich content correctly', () => {
    const richContentItems: MuiAccordionProps['items'] = [
      {
        id: 'rich-text',
        label: 'Rich Content',
        content: (
          <p>
            This is <strong>bold</strong> text inside the accordion.
          </p>
        ),
      },
    ];

    render(<MuiAccordion items={richContentItems} />);

    fireEvent.click(screen.getByText('Rich Content'));

    expect(screen.getByText(/This is/i)).toBeVisible();
    expect(screen.getByText(/text inside the accordion/i)).toBeVisible();
    expect(screen.getByText('bold')).toBeVisible();
  });

  it('renders a ReactNode label as given, inside the summary button', () => {
    render(
      <MuiAccordion
        items={[
          {
            id: 'node-label',
            label: <span>Node label</span>,
            content: 'Node content',
          },
        ]}
      />,
    );

    fireEvent.click(getSummary('Node label'));
    expect(screen.getByText('Node content')).toBeVisible();
  });

  it('renders each summary as a button named by its label, collapsed', () => {
    render(<MuiAccordion items={mockAccordionItems} />);

    const summaries = screen.getAllByRole('button');
    expect(summaries).toHaveLength(mockAccordionItems.length);
    mockAccordionItems.forEach(({label}) => {
      const summary = getSummary(label as string);
      expect(summary).toHaveAttribute('type', 'button');
      expect(summary).toHaveAttribute('aria-expanded', 'false');
    });

    fireEvent.click(getSummary('Second Accordion'));
    expect(getSummary('Second Accordion')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('toggles an item with Enter and with Space', async () => {
    const user = userEvent.setup();
    render(<MuiAccordion items={mockAccordionItems} />);

    const summary = getSummary('First Accordion');
    summary.focus();

    await user.keyboard('{Enter}');
    expect(summary).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText('This is the first accordion content.'),
    ).toBeVisible();

    await user.keyboard(' ');
    expect(summary).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(
        screen.getByText('This is the first accordion content.'),
      ).not.toBeVisible(),
    );
  });

  it('stops Tab once per item and skips links in closed content', async () => {
    const user = userEvent.setup();
    render(
      <MuiAccordion
        items={[
          {
            id: 'with-link',
            label: 'With link',
            content: <a href="#target">Hidden link</a>,
          },
          {id: 'plain', label: 'Plain', content: 'Plain content'},
        ]}
      />,
    );

    await user.tab();
    expect(getSummary('With link')).toHaveFocus();
    await user.tab();
    expect(getSummary('Plain')).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('reaches a link in open content with Tab', async () => {
    const user = userEvent.setup();
    render(
      <MuiAccordion
        items={[
          {
            id: 'with-link',
            label: 'With link',
            content: <a href="#target">Shown link</a>,
          },
          {id: 'plain', label: 'Plain', content: 'Plain content'},
        ]}
      />,
    );

    await user.click(getSummary('With link'));
    await user.tab();
    expect(screen.getByRole('link', {name: 'Shown link'})).toHaveFocus();
    await user.tab();
    expect(getSummary('Plain')).toHaveFocus();
  });

  it('adds no heading, no region, and no ids of its own', () => {
    const {container} = render(
      <MuiAccordion id="faq-root" items={mockAccordionItems} />,
    );

    fireEvent.click(getSummary('First Accordion'));

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    const ids = Array.from(container.querySelectorAll('[id]')).map(
      element => element.id,
    );
    expect(ids).toEqual(['faq-root']);
    screen.getAllByRole('button').forEach(summary => {
      expect(summary).not.toHaveAttribute('aria-controls');
    });
  });

  it('hides the chevron from assistive technology', () => {
    render(<MuiAccordion items={mockAccordionItems} />);

    const summary = getSummary('First Accordion');
    expect(summary).toHaveAccessibleName('First Accordion');
    expect(within(summary).getByTestId('font-awesome-v6-icon')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('puts no <p> inside the summary button for a string label', () => {
    render(<MuiAccordion items={mockAccordionItems} />);

    expect(
      getSummary('First Accordion').querySelector('p'),
    ).not.toBeInTheDocument();
  });

  it('renders a string content as a paragraph', () => {
    render(<MuiAccordion items={mockAccordionItems} />);

    expect(
      screen.getByText('This is the first accordion content.').tagName,
    ).toBe('P');
  });

  it('applies className, id, data-* and style to the root', () => {
    render(
      <MuiAccordion
        items={mockAccordionItems}
        className="consumer-class"
        id="consumer-id"
        data-testid="accordion-root"
        style={{marginTop: '12px'}}
        aria-label="Course questions"
      />,
    );

    const root = screen.getByTestId('accordion-root');
    expect(root).toHaveClass('consumer-class');
    expect(root).toHaveAttribute('id', 'consumer-id');
    expect(root).toHaveAttribute('aria-label', 'Course questions');
    expect(root).toHaveStyle({marginTop: '12px'});
    expect(within(root).getAllByRole('button')).toHaveLength(3);
  });

  it('renders in place and leaves no global listener or body state', () => {
    // React registers its document listener on the first render in a document.
    render(<div />);
    const spies = [document, window].flatMap(target => [
      vi.spyOn(target, 'addEventListener'),
      vi.spyOn(target, 'removeEventListener'),
    ]);
    const bodyStyle = document.body.getAttribute('style');

    const {container} = render(<MuiAccordion items={mockAccordionItems} />);
    fireEvent.click(getSummary('First Accordion'));
    getSummary('Second Accordion').focus();

    expect(
      within(container).getByText('This is the first accordion content.'),
    ).toBeVisible();
    expect(document.body.getAttribute('style')).toBe(bodyStyle);
    expect(document.querySelectorAll('[aria-hidden="true"]')).toHaveLength(
      mockAccordionItems.length,
    );
    // React's development build adds and removes a window 'error' listener per event.
    for (const [added, removed] of [spies.slice(0, 2), spies.slice(2)]) {
      expect(removed.mock.calls).toEqual(added.mock.calls);
    }

    spies.forEach(spy => spy.mockRestore());
  });
});
