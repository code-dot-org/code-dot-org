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
      subjects: ['math'],
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

  it('shows image with empty alt text by default', () => {
    render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByAltText('');
  });

  it('can have image alt text if passed in', () => {
    const altText = 'Two people coding';
    render(<CurriculumCatalogCard {...defaultProps} imageAltText={altText} />);

    screen.getByAltText(altText);
  });

  it('renders grade range', () => {
    render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByText(
      new RegExp(
        `Grades: ${defaultProps.youngestGrade}-${defaultProps.oldestGrade}`
      )
    );
  });

  it('renders subject', () => {
    render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByText(defaultProps.subjects[0], {exact: false});
  });

  it('renders duration', () => {
    render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByText(defaultProps.duration, {exact: false});
  });
});
