import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {pull} from 'lodash';
import {expect} from '../../../util/reconfiguredChai';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';
import {
  subjectsAndTopicsOrder,
  translatedCourseOfferingCsTopics,
  translatedLabels,
} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';
import {sections} from '../studioHomepages/fakeSectionUtils';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

describe('CurriculumCatalogCard', () => {
  const translationIconTitle = 'Curriculum is available in your language';

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

  let defaultProps;
  let store;
  const renderCurriculumCard = (props = defaultProps) =>
    render(
      <Provider store={store}>
        <CurriculumCatalogCard {...props} />
      </Provider>
    );

  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections});
    store = getStore();
    defaultProps = {
      courseDisplayName: 'AI for Oceans',
      courseDisplayNameWithLatestYear: 'AI for Oceans (2022)',
      duration: 'quarter',
      gradesArray: ['4', '5', '6', '7', '8'],
      isEnglish: true,
      pathToCourse: '/s/course',
      scriptId: 1,
      isSignedOut: true,
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  it('renders course name', () => {
    renderCurriculumCard();

    screen.getByRole('heading', {name: defaultProps.courseName});
  });

  it('renders image with empty alt text by default', () => {
    renderCurriculumCard();

    // with empty alt text, the image name is the same as the header name
    screen.getByRole('img', {name: defaultProps.courseName});
  });

  it('renders image with alt text if passed in', () => {
    const altText = 'Two people coding';
    renderCurriculumCard({...defaultProps, imageAltText: altText});

    // when alt text is present, the img name is the alt text
    screen.getByRole('img', {name: altText});
  });

  it('renders one subject name, the first available from ordered list, when present', () => {
    renderCurriculumCard({...defaultProps, subjects: subjects, topics: topics});

    screen.getByText(subjectsAndTopicsOrder[firstSubjectIndexUsed], {
      exact: false,
    });
  });

  it('renders label of number of remaining subjects and topics when there is more than one present', () => {
    renderCurriculumCard({...defaultProps, subjects: subjects, topics: topics});

    screen.getByText(`+${subjects.length + topics.length - 1}`);
  });

  it('renders tooltip showing full text of first label when hovering over it', () => {
    renderCurriculumCard({...defaultProps, subjects: subjects, topics: topics});
    const firstLabelText =
      translatedLabels[subjectsAndTopicsOrder[firstSubjectIndexUsed]];
    const firstLabelNode = screen.getByText(firstLabelText);

    fireEvent.mouseOver(firstLabelNode);
    expect(screen.getAllByText(firstLabelText)).to.have.lengthOf(2);
  });

  it('renders tooltip showing full text of first label when focused on it', () => {
    renderCurriculumCard({...defaultProps, subjects: subjects, topics: topics});
    const firstLabelText =
      translatedLabels[subjectsAndTopicsOrder[firstSubjectIndexUsed]];
    const firstLabelNode = screen.getByText(firstLabelText);
    firstLabelNode.focus();
    expect(screen.getAllByText(firstLabelText)).to.have.lengthOf(2);
  });

  it('renders tooltip showing remaining labels when hovering on plus sign', () => {
    renderCurriculumCard({...defaultProps, subjects: subjects, topics: topics});
    const remainingLabels = pull(
      [...subjects, ...topics],
      subjectsAndTopicsOrder[firstSubjectIndexUsed]
    );
    const plusSignText = screen.getByText(
      `+${subjects.length + topics.length - 1}`
    );

    // does not show when not hovered
    remainingLabels.forEach(
      label => expect(screen.queryByText(translatedLabels[label])).to.be.null
    );

    fireEvent.mouseOver(plusSignText);
    remainingLabels.forEach(label => screen.getByText(translatedLabels[label]));
  });

  it('renders tooltip showing remaining labels when plus sign is focused', () => {
    renderCurriculumCard({...defaultProps, subjects: subjects, topics: topics});
    const remainingLabels = pull(
      [...subjects, ...topics],
      subjectsAndTopicsOrder[firstSubjectIndexUsed]
    );
    const plusSignText = screen.getByText(
      `+${subjects.length + topics.length - 1}`
    );
    plusSignText.focus();
    remainingLabels.forEach(label => screen.getByText(translatedLabels[label]));
  });

  it('renders one topic, the first available from ordered list, if no subject present', () => {
    renderCurriculumCard({...defaultProps, topics: topics});

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
    renderCurriculumCard({
      ...defaultProps,
      subjects: ['math'],
      topics: undefined,
    });

    expect(screen.queryByText('+')).to.be.null;

    renderCurriculumCard({
      ...defaultProps,
      topics: ['data'],
      subjects: undefined,
    });
    expect(screen.queryByText('+')).to.be.null;
  });

  it('does not render translation icon when in English locale', () => {
    const {container} = renderCurriculumCard();

    expect(screen.queryByTitle(translationIconTitle)).to.be.null;
    expect(container.querySelectorAll('i[class*=language]')).to.have.length(0);
  });

  it('does not render translation icon if translation is not available', () => {
    const {container} = renderCurriculumCard({
      ...defaultProps,
      isEnglish: false,
      isTranslated: false,
    });

    expect(screen.queryByTitle(translationIconTitle)).to.be.null;
    expect(container.querySelectorAll('i[class*=language]')).to.have.length(0);
  });

  it('renders translation icon when translation is available in non-English locale', () => {
    const {container} = renderCurriculumCard({
      ...defaultProps,
      isEnglish: false,
      isTranslated: true,
    });

    screen.getByTitle(translationIconTitle);
    expect(container.querySelectorAll('i[class*=language]')).to.have.length(1);
  });

  it('renders grade range with icon', () => {
    const {container} = renderCurriculumCard();

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
    const {container} = renderCurriculumCard({
      ...defaultProps,
      gradesArray: [grade],
    });

    screen.getByText(new RegExp(`Grade: ${grade}`));
    expect(container.querySelectorAll('i[class*=user]')).to.have.length(1);
  });

  it('renders duration with icon', () => {
    const {container} = renderCurriculumCard();

    screen.getByText(defaultProps.duration, {exact: false});
    expect(container.querySelectorAll('i[class*=clock]')).to.have.length(1);
  });

  it('renders Quick View button with descriptive label', () => {
    renderCurriculumCard();

    screen.getByLabelText(
      new RegExp(`View details about ${defaultProps.courseDisplayName}`)
    );
  });

  it('renders Assign button with descriptive label', () => {
    renderCurriculumCard();

    screen.getByRole('button', {
      name: new RegExp(
        `Assign ${defaultProps.courseDisplayName} to your classroom`
      ),
    });
  });

  it('clicking Assign button as a teacher with sections shows dialog with sections and catalog-specific text with year', () => {
    store.dispatch(setSections(sections));
    renderCurriculumCard({
      ...defaultProps,
      isSignedOut: false,
      isTeacher: true,
    });

    const assignButton = screen.getByRole('button', {
      name: new RegExp(
        `Assign ${defaultProps.courseDisplayName} to your classroom`
      ),
    });

    sections.forEach(
      section => expect(screen.queryByText(section.name)).to.be.null
    );
    fireEvent.click(assignButton);
    sections.forEach(section => screen.getByText(section.name));
    screen.getByText(defaultProps.courseDisplayNameWithLatestYear, {
      exact: false,
    });
    screen.getByText('The most recent recommended version', {
      exact: false,
    });
  });

  it('clicking Assign button as a teacher without sections shows dialog to create section', () => {
    renderCurriculumCard({
      ...defaultProps,
      isSignedOut: false,
      isTeacher: true,
    });

    const assignButton = screen.getByRole('button', {
      name: new RegExp(
        `Assign ${defaultProps.courseDisplayName} to your classroom`
      ),
    });

    fireEvent.click(assignButton);
    screen.getByRole('heading', {
      name: 'Create class section to assign a curriculum',
    });
  });

  it('clicking Assign button as a student shows dialog to upgrade account', () => {
    renderCurriculumCard({
      ...defaultProps,
      isSignedOut: false,
      isTeacher: false,
    });

    const assignButton = screen.getByRole('button', {
      name: new RegExp(
        `Assign ${defaultProps.courseDisplayName} to your classroom`
      ),
    });

    fireEvent.click(assignButton);
    screen.getByRole('heading', {
      name: 'Use a teacher account to assign a curriculum',
    });
  });

  it('clicking Assign button as a signed out user shows dialog to sign in', () => {
    renderCurriculumCard();

    const assignButton = screen.getByRole('button', {
      name: new RegExp(
        `Assign ${defaultProps.courseDisplayName} to your classroom`
      ),
    });

    fireEvent.click(assignButton);
    screen.getByRole('heading', {
      name: 'Sign in or create account to assign a curriculum',
    });
  });
});
