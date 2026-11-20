import {fireEvent, render, screen} from '@testing-library/react';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

import {MuiFAQAccordion, MuiFAQAccordionProps} from '../index';

const mockFAQItems: MuiFAQAccordionProps['items'] = [
  {
    id: 'what-is-code-org',
    label: 'What is Code.org?',
    questionString: 'What is Code.org?',
    content: 'Code.org is a nonprofit organization.',
    answerString: 'Code.org is a nonprofit organization.',
  },
  {
    id: 'how-can-i-start-learning',
    label: 'How can I start learning?',
    questionString: 'How can I start learning?',
    content: 'You can start with free courses on our website.',
    answerString: 'You can start with free courses on our website.',
  },
  {
    id: 'is-the-curriculum-free',
    label: 'Is the curriculum free?',
    questionString: 'Is the curriculum free?',
    content: 'Yes! All curriculum materials are free to use.',
    answerString: 'Yes! All curriculum materials are free to use.',
  },
];

describe('MuiFAQAccordion Component', () => {
  it('renders the MuiFAQAccordion component with all questions', () => {
    render(<MuiFAQAccordion items={mockFAQItems} />);

    mockFAQItems.forEach(({label}) => {
      expect(screen.getByText(`${label}`)).toBeInTheDocument();
    });
  });

  it('opens an answer from its question', () => {
    render(<MuiFAQAccordion items={mockFAQItems} />);

    const question = screen.getByRole('button', {name: 'What is Code.org?'});
    expect(
      screen.getByText('Code.org is a nonprofit organization.'),
    ).not.toBeVisible();

    fireEvent.click(question);
    expect(question).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText('Code.org is a nonprofit organization.'),
    ).toBeVisible();
  });

  it('renders the FAQPage JSON-LD script as the root next sibling', () => {
    render(
      <MuiFAQAccordion
        items={mockFAQItems}
        className="faq"
        data-testid="faq-root"
      />,
    );

    const root = screen.getByTestId('faq-root');
    expect(root).toHaveClass('faq');
    const script = root.nextElementSibling;
    expect(script?.tagName).toBe('SCRIPT');
    expect(script).toHaveAttribute('type', 'application/ld+json');

    const data = JSON.parse(script?.textContent ?? '');
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toEqual(
      mockFAQItems.map(({questionString, answerString}) => ({
        '@type': 'Question',
        name: questionString,
        acceptedAnswer: {'@type': 'Answer', text: answerString},
      })),
    );
  });

  it('exports the faqAccordion entry under its documented path', () => {
    const {exports} = JSON.parse(
      readFileSync(resolve(__dirname, '../../../../package.json'), 'utf8'),
    );

    expect(exports['./accordion/faqAccordion']).toBeDefined();
    expect(exports['./accordrion/faqAccordion']).toBeUndefined();
  });
});
