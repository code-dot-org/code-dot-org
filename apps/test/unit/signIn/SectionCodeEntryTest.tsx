import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import SectionCodeEntry, {
  SectionCodeEntryProps,
} from '@cdo/apps/signIn/SectionCodeEntry';

const DEFAULT_PROPS: SectionCodeEntryProps = {
  sectionCodeHeading: 'Enter your 6 letter section code',
  sectionCodeLabel: 'Enter your 6 letter section code',
  sectionCodePlaceholder: 'Section Code (ABCDEF)',
  defaultSectionCode: '',
  goLabel: 'Go',
  formAction: '/users/new',
};

describe('SectionCodeEntry', () => {
  function renderEntry(overrides: Partial<SectionCodeEntryProps> = {}) {
    return render(<SectionCodeEntry {...DEFAULT_PROPS} {...overrides} />);
  }

  it('renders the heading, section-code input, and Go button', () => {
    renderEntry();

    screen.getByRole('heading', {name: DEFAULT_PROPS.sectionCodeHeading});
    expect(
      screen.getByRole('textbox', {name: DEFAULT_PROPS.sectionCodeLabel})
    ).toHaveAttribute('name', 'section_code');
    screen.getByRole('button', {name: DEFAULT_PROPS.goLabel});
  });

  it('pre-populates the input with defaultSectionCode when provided', () => {
    renderEntry({defaultSectionCode: 'ABCDEF'});
    expect(
      screen.getByRole('textbox', {name: DEFAULT_PROPS.sectionCodeLabel})
    ).toHaveValue('ABCDEF');
  });

  it('submits via GET to the provided form action', () => {
    renderEntry({formAction: '/users/new'});
    const form = screen
      .getByRole('button', {name: DEFAULT_PROPS.goLabel})
      .closest('form');
    expect(form).toHaveAttribute('action', '/users/new');
    expect(form).toHaveAttribute('method', 'get');
  });
});
