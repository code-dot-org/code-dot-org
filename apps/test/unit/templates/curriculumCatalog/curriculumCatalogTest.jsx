import React from 'react';
import {render, screen} from '@testing-library/react';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';

describe('CurriculumCatalogCard', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      courseDisplayName: 'AI for Oceans',
      duration: 'quarter',
      youngestGrade: 4,
      oldestGrade: 12,
      subjects: ['english_language_arts'],
      topics: ['cybersecurity']
    };
  });

  it('renders course name', () => {
    render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByRole('heading', {name: defaultProps.courseName});
  });

  it('shows image', () => {
    render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByRole('img', {name: defaultProps.courseName});
  });

  it('shows image without description by default', () => {
    render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByRole('img', {name: ''});
  });

  it('can have image alt text if passed in', () => {
    const altText = 'Two people coding';
    render(<CurriculumCatalogCard {...defaultProps} imageAltText={altText} />);

    screen.getByRole('img', {name: altText});
  });
});
