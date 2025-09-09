import {render, screen, fireEvent} from '@testing-library/react';

import Accordion, {AccordionProps} from './../Accordion';

const mockAccordionItems: AccordionProps['items'] = [
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

describe('Accordion Component', () => {
  it('renders all accordion items', () => {
    render(<Accordion items={mockAccordionItems} />);

    mockAccordionItems.forEach(({label}) => {
      expect(screen.getByText(`${label}`)).toBeVisible();
    });
  });

  it('should not show content initially', () => {
    render(<Accordion items={mockAccordionItems} />);

    mockAccordionItems.forEach(({content}) => {
      expect(screen.queryByText(`${content}`)).not.toBeVisible();
    });
  });

  it('should expand and collapse the accordion items', () => {
    render(<Accordion items={mockAccordionItems} />);

    const firstAccordion = screen.getByText('First Accordion');
    expect(
      screen.queryByText('This is the first accordion content.'),
    ).not.toBeVisible();

    fireEvent.click(firstAccordion);
    expect(
      screen.getByText('This is the first accordion content.'),
    ).toBeVisible();

    fireEvent.click(firstAccordion);
    expect(
      screen.queryByText('This is the first accordion content.'),
    ).not.toBeVisible();
  });

  it('should allow multiple accordions to be opened separately', () => {
    render(<Accordion items={mockAccordionItems} />);

    const firstAccordion = screen.getByText('First Accordion');
    const secondAccordion = screen.getByText('Second Accordion');

    fireEvent.click(firstAccordion);
    expect(
      screen.getByText('This is the first accordion content.'),
    ).toBeVisible();

    fireEvent.click(secondAccordion);
    expect(
      screen.getByText('This is the second accordion content.'),
    ).toBeVisible();
  });

  it('should render rich content correctly', () => {
    const richContentItems: AccordionProps['items'] = [
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

    render(<Accordion items={richContentItems} />);

    const label = screen.getByText('Rich Content');
    fireEvent.click(label);

    // expect(screen.getByText(/This is bold text inside the accordion/i)).toBeInTheDocument();
    expect(screen.getByText(/This is/i)).toBeInTheDocument();
    expect(screen.getByText(/text inside the accordion/i)).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
  });
});
