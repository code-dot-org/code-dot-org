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
    const section = screen
      .getByText('This is content.')
      .closest('.container')?.parentElement;

    // check if background color is light gray
    expect(section).toHaveStyle(
      'background-color: var(--background-neutral-secondary)',
    );

    // change background color to light teal
    rerender(
      <Section background={sectionBackground.brandLightPrimary}>
        <div>This is content.</div>
      </Section>,
    );

    // check if background color is light teal
    expect(section).toHaveStyle(
      'background-color: var(--background-brand-light-primary)',
    );
  });

  it('renders a divider based on the divider prop', () => {
    const {rerender} = renderComponent({divider: 'primary'});

    let section = screen
      .getByText('This is content.')
      .closest('.container')?.parentElement;

    let divider = section?.querySelector('hr');
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveStyle(
      'border-top-color: var(--background-neutral-quaternary)',
    );

    // change divider prop to strong
    rerender(
      <Section divider="strong">
        <div>This is content.</div>
      </Section>,
    );

    section = screen
      .getByText('This is content.')
      .closest('.container')?.parentElement;

    divider = section?.querySelector('hr');
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveStyle(
      'border-top-color: var(--background-neutral-senary)',
    );

    // change divider prop to none
    rerender(
      <Section divider="none">
        <div>This is content.</div>
      </Section>,
    );

    section = screen
      .getByText('This is content.')
      .closest('.container')?.parentElement;

    divider = section?.querySelector('hr');
    expect(divider).not.toBeInTheDocument();
  });

  it('applies a custom ID to the section', () => {
    renderComponent({id: 'section-id'});

    const section = screen
      .getByText('This is content.')
      .closest('.container')?.parentElement;

    // check if the section element has the correct id
    expect(section).toHaveAttribute('id', 'section-id');
  });
});
