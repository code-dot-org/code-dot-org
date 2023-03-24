import React from 'react';
import {render, screen} from '@testing-library/react';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';

describe('CurriculumCatalogCard', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      courseName: 'Express Course',
      duration: 'Quarter',
      gradeOrAgeRange: 'Grades 4-12',
      imageName: 'another-hoc',
      topic: 'Programming',
      quickViewButtonText: 'Quick View',
      assignButtonText: 'Assign',

      // for screenreaders
      quickViewButtonDescription: 'View more details about the Express Course',
      assignButtonDescription: 'Assign the Express Course'
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
    const altText = 'Image shows two people coding';
    render(<CurriculumCatalogCard {...defaultProps} imageAltText={altText} />);

    screen.getByRole('img', {name: altText});
  });
});
