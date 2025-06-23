import {render, screen} from '@testing-library/react';

import FAQAccordion, {FAQAccordionProps} from '../FAQAccordion';

const mockFAQItems: FAQAccordionProps['items'] = [
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

describe('faqAccordion Component', () => {
  it('renders the faqAccordion component with all questions', () => {
    render(<FAQAccordion items={mockFAQItems} />);

    mockFAQItems.forEach(({label}) => {
      expect(screen.getByText(`${label}`)).toBeInTheDocument();
    });
  });
});
