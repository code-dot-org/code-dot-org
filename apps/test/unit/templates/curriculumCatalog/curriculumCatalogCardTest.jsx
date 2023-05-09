import React from 'react';
import {render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';
import {
  subjectsAndTopicsOrder,
  translatedCourseOfferingCsTopics,
} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';

describe('CurriculumCatalogCard', () => {
  const translationIconTitle = 'Curriculum is available in your language';

  let defaultProps;
  const firstSubjectIndexInList = 0;
  const firstSubjectIndexUsed = firstSubjectIndexInList + 1;
  const subjects = [
    // mix up the order to check consistent order prioritization
    subjectsAndTopicsOrder[firstSubjectIndexUsed + 1],
    subjectsAndTopicsOrder[firstSubjectIndexUsed],
  ];

  const firstTopicIndexInList = 4;
  const firstTopicIndexUsed = firstTopicIndexInList + 4;
  const topics = [
    // mix up the order to check consistent order prioritization
    subjectsAndTopicsOrder[firstTopicIndexUsed + 3],
    subjectsAndTopicsOrder[firstTopicIndexUsed],
    subjectsAndTopicsOrder[firstTopicIndexUsed + 4],
  ];

  beforeEach(() => {
    defaultProps = {
      courseDisplayName: 'AI for Oceans',
      duration: 'quarter',
      gradesArray: ['4', '5', '6', '7', '8'],
      isEnglish: true,
      pathToCourse: '/s/course',
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

  it('renders one subject name, the first available from ordered list, when present', () => {
    render(
      <CurriculumCatalogCard
        {...defaultProps}
        subjects={subjects}
        topics={topics}
      />
    );

    screen.getByText(subjectsAndTopicsOrder[firstSubjectIndexUsed], {
      exact: false,
    });
  });

  it('renders label of number of remaining subjects and topics when there is more than one present', () => {
    render(
      <CurriculumCatalogCard
        {...defaultProps}
        subjects={subjects}
        topics={topics}
      />
    );

    screen.getByText(`+${subjects.length + topics.length - 1}`);
  });

  it('renders one topic, the first available from ordered list, if no subject present', () => {
    render(<CurriculumCatalogCard {...defaultProps} topics={topics} />);

    screen.getByText(
      translatedCourseOfferingCsTopics[
        subjectsAndTopicsOrder[firstTopicIndexUsed]
      ],
      {
        exact: false,
      }
    );
  });

  it('does not render label of remaining subjects and topics when exactly one subject or topic is present', () => {
    render(
      <CurriculumCatalogCard
        {...defaultProps}
        subjects={['math']}
        topics={undefined}
      />
    );
    expect(screen.queryByText('+')).to.be.null;

    render(
      <CurriculumCatalogCard
        {...defaultProps}
        topics={['data']}
        subjects={undefined}
      />
    );
    expect(screen.queryByText('+')).to.be.null;
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

    const link = screen.getByRole('link', {
      name: new RegExp(`View details about ${defaultProps.courseDisplayName}`),
    });
    expect(link).to.have.property('href').to.contain(defaultProps.pathToCourse);
  });

  it('renders Assign button with descriptive label', () => {
    render(<CurriculumCatalogCard {...defaultProps} />);

    screen.getByRole('button', {
      name: new RegExp(
        `Assign ${defaultProps.courseDisplayName} to your classroom`
      ),
    });
  });
});
