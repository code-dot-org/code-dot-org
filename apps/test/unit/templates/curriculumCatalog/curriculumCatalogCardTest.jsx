import React from 'react';
import {render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';

describe('CurriculumCatalogCard', () => {
  const translationIconTitle = 'Curriculum is available in your language';

  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      courseDisplayName: 'AI for Oceans',
      duration: 'quarter',
      gradesArray: ['4', '5', '6', '7', '8'],
      subjects: ['math'],
      topics: ['cybersecurity'],
      isEnglish: true
    };
  });

  it('renders course name', () => {
    render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByRole('heading', {name: defaultProps.courseName});
  });

  it('renders image with empty alt text by default', () => {
    render(<CurriculumCatalogCard {...defaultProps} />);

    // with empty alt text, the image name is the same as the header name
    screen.getByRole('img', {name: defaultProps.courseName});
  });

  it('renders image with alt text if passed in', () => {
    const altText = 'Two people coding';
    render(<CurriculumCatalogCard {...defaultProps} imageAltText={altText} />);

    // when alt text is present, the img name is the alt text
    screen.getByRole('img', {name: altText});
  });

  it('renders subject', () => {
    render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByText(defaultProps.subjects[0], {exact: false});
  });

  it('does not render translation icon by default', () => {
    const {container} = render(<CurriculumCatalogCard {...defaultProps} />);

    expect(screen.queryByTitle(translationIconTitle)).to.be.null;
    expect(container.querySelectorAll('i[class*=language]')).to.have.length(0);
  });

  it('renders translation icon when translation is available', () => {
    const {container} = render(
      <CurriculumCatalogCard {...defaultProps} isTranslated />
    );

    screen.getByTitle(translationIconTitle);
    expect(container.querySelectorAll('i[class*=language]')).to.have.length(1);
  });

  it('renders grade range with icon', () => {
    const {container} = render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByText(
      new RegExp(
        `Grades: ${defaultProps.gradesArray[0]}-${
          defaultProps.gradesArray[defaultProps.gradesArray.length - 1]
        }`
      )
    );
    expect(container.querySelectorAll('i[class*=user]')).to.have.length(1);
  });

  it('renders single grade with icon when one grade passed in', () => {
    const grade = '12';
    const {container} = render(
      <CurriculumCatalogCard {...defaultProps} gradesArray={[grade]} />
    );

    screen.getByText(new RegExp(`Grade: ${grade}`));
    expect(container.querySelectorAll('i[class*=user]')).to.have.length(1);
  });

  it('renders duration with icon', () => {
    const {container} = render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByText(defaultProps.duration, {exact: false});
    expect(container.querySelectorAll('i[class*=clock]')).to.have.length(1);
  });

  it('renders Quick View button with descriptive label', () => {
    render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByRole('button', {
      name: new RegExp(`View details about ${defaultProps.courseDisplayName}`)
    });
  });

  it('renders Assign button with descriptive label', () => {
    render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByRole('button', {
      name: new RegExp(
        `Assign ${defaultProps.courseDisplayName} to your classroom`
      )
    });
  });
});
