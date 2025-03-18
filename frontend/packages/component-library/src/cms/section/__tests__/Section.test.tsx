import {render, screen} from '@testing-library/react';
import Section, {SectionProps, sectionBackground} from '../Section';

describe('Section Component', () => {
  const renderComponent = (props: Partial<SectionProps> = {}) => {
    return render(
      <Section {...props}>
        <div>This is content.</div>
      </Section>,
    );
  };

  it('renders children content', () => {
    renderComponent();

    // check if children content is in the document
    expect(screen.getByText('This is content.')).toBeInTheDocument();
  });

  it('changes background color based on props', () => {
    const {rerender} = renderComponent({
      background: sectionBackground.secondary,
    });

    // check if background color is light gray
    expect(screen.getByText('This is content.').parentElement).toHaveStyle(
      'background-color: var(--background-neutral-secondary)',
    );

    // change background color to light teal
    rerender(
      <Section background="brandLightPrimary">
        <div>This is content.</div>
      </Section>,
    );

    // check if background color is light teal
    expect(screen.getByText('This is content.').parentElement).toHaveStyle(
      'background-color: var(--background-brand-light-primary)',
    );
  });
});
