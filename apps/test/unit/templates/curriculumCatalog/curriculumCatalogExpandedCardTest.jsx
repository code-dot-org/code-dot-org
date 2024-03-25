import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import ExpandedCurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/ExpandedCurriculumCatalogCard';
import {translatedAvailableResources} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import sinon from 'sinon';
import {FULL_TEST_COURSES} from '../../util/curriculumRecommenderTestCurricula';

describe('CurriculumCatalogExpandedCard', () => {
  let defaultProps;
  let store;

  const renderCurriculumExpandedCard = (props = defaultProps) =>
    render(
      <Provider store={store}>
        <ExpandedCurriculumCatalogCard {...props} />
      </Provider>
    );

  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections});
    store = getStore();
    defaultProps = {
      courseKey: 'oceans',
      courseDisplayName: 'AI for Oceans',
      duration: 'quarter',
      gradeRange: 'Grades: 3-12',
      subjectsAndTopics: ['Artificial Intelligence', 'Data'],
      deviceCompatibility:
        '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
      description:
        'In this fun introduction to artificial intelligence, you train a real machine learning model to identify sea creatures and trash in the ocean. ',
      video:
        'https://www.youtube-nocookie.com/embed/KHbwOetbmbs/?autoplay=1&enablejsapi=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=1&v=KHbwOetbmbs&wmode=transparent',
      publishedDate: '2019-12-01T13:00:00.000Z',
      pathToCourse: '/s/course',
      assignButtonOnClick: () => {},
      assignButtonDescription: 'Assign AI for Oceans to your classroom',
      onClose: () => {},
      isInUS: true,
      imageSrc:
        'https://images.code.org/58cc5271d85e017cf5030ea510ae2715-AI for Oceans.png',
      isSignedOut: false,
      isTeacher: true,
      setExpandedCardKey: () => {},
      getRecommendedSimilarCurriculum: () => {
        return FULL_TEST_COURSES[0];
      },
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  it('renders course name', () => {
    renderCurriculumExpandedCard();

    screen.getByRole('heading', {
      name: defaultProps.courseDisplayName,
      hidden: true,
    });
  });

  it('renders grade range with icon', () => {
    const {container} = renderCurriculumExpandedCard();

    screen.getByText(defaultProps.gradeRange);
    expect(container.querySelectorAll('i[class*=user]')).to.have.length(1);
  });

  it('renders single grade with icon when one grade passed in', () => {
    const grade = 'Grades: 12';
    const {container} = renderCurriculumExpandedCard({
      ...defaultProps,
      gradeRange: grade,
    });

    screen.getByText(grade);
    expect(container.querySelectorAll('i[class*=user]')).to.have.length(1);
  });

  it('renders duration with icon', () => {
    const duration = 'quarter';
    const {container} = renderCurriculumExpandedCard({
      ...defaultProps,
      duration: duration,
    });

    screen.getByText(duration);
    expect(container.querySelectorAll('i[class*=clock]')).to.have.length(1);
  });

  it('renders topics with icon', () => {
    const {container} = renderCurriculumExpandedCard();

    screen.getByText(
      new RegExp(`Topic: ${defaultProps.subjectsAndTopics.join(', ')}`)
    );
    expect(container.querySelectorAll('i[class*=book]')).to.have.length(1);
  });

  it('renders video if available', () => {
    renderCurriculumExpandedCard();

    screen.getAllByTitle('Youtube embed');
  });

  it('renders image if no video available', () => {
    renderCurriculumExpandedCard({
      ...defaultProps,
      video: null,
    });

    // Expect to find 2 images: one as the video replacement and one from the Similar Curriculum recommendation
    expect(screen.getAllByRole('img', {hidden: true}).length).to.equal(2);
  });

  it('renders image with alt text if passed and no video', () => {
    const altText = 'Ocean and fishes';
    renderCurriculumExpandedCard({
      ...defaultProps,
      video: null,
      imageAltText: altText,
    });

    // when alt text is present, the img name is the alt text
    screen.getByRole('img', {name: altText, hidden: true});
  });

  it('renders available resources section when resources are available', () => {
    const availableResources = {
      'Lesson Plan': '/s/oceans/lessons/1',
      'Slide Deck': 'slides',
    };
    renderCurriculumExpandedCard({
      ...defaultProps,
      availableResources: availableResources,
    });

    const availableResourcesContainer = screen.getByText(
      'Available Resources'
    ).parentElement;

    //Checks for each available resource in availableResources
    Object.keys(availableResources).forEach(resource => {
      screen.getByText(translatedAvailableResources[resource]);
    });

    //Checks for correct amount of Horizontal dividers
    expect(availableResourcesContainer.querySelectorAll('hr')).to.have.length(
      Object.keys(availableResources).length
    );
  });

  it('does not render available resources section when no available resources', () => {
    renderCurriculumExpandedCard();

    expect(screen.queryByText('Available Resources')).to.be.null;
  });

  it('renders professional learning section when professional learning available', () => {
    const professional_learning_program = 'https://code.org/apply';
    const self_paced_pl_course_offering_path = '/courses/vpl-csa-2023';
    renderCurriculumExpandedCard({
      ...defaultProps,
      professionalLearningProgram: professional_learning_program,
      selfPacedPlCourseOfferingPath: self_paced_pl_course_offering_path,
    });

    screen.getByText('Professional Learning');
    screen.getByText('Facilitator led workshops');
    screen.getByText('Self-paced PL');
  });

  it('does not render professional learning section when no professional learning available', () => {
    renderCurriculumExpandedCard();

    expect(screen.queryByText('Profession Learning')).to.be.null;
  });

  it('does not render professional learning section when not in US', () => {
    const professional_learning_program = 'https://code.org/apply';
    const self_paced_pl_course_offering_path = '/courses/vpl-csa-2023';
    renderCurriculumExpandedCard({
      ...defaultProps,
      professionalLearningProgram: professional_learning_program,
      selfPacedPlCourseOfferingPath: self_paced_pl_course_offering_path,
      isInUS: false,
    });

    expect(screen.queryByText('Profession Learning')).to.be.null;
  });

  it('renders devices and their correct icons', () => {
    const deviceIcons = {
      ideal: 'circle-check',
      not_recommended: 'triangle-exclamation',
      incompatible: 'circle-xmark',
    };
    renderCurriculumExpandedCard();

    const devices = JSON.parse(defaultProps.deviceCompatibility);

    Object.keys(devices).forEach(device => {
      const newDevice = device === 'no_device' ? 'Offline' : device;
      const deviceElement = screen.getByText(newDevice, {exact: false});

      const parentElement = deviceElement.parentElement;
      expect(
        parentElement.querySelectorAll(
          `i[class*=${deviceIcons[devices[device]]}]`
        )
      ).to.have.length(1);
    });
  });

  it('clicking assign button triggers onAssign function', () => {
    const onAssign = sinon.spy();
    renderCurriculumExpandedCard({
      ...defaultProps,
      assignButtonOnClick: onAssign,
    });

    expect(onAssign).not.to.have.been.called;

    const assignButton = screen.getByRole('button', {
      name: new RegExp(
        `Assign ${defaultProps.courseDisplayName} to your classroom`
      ),
      hidden: true,
    });

    fireEvent.click(assignButton);

    expect(onAssign).to.have.been.calledOnce;
  });

  it('clicking close button triggers onClose function', () => {
    const onClose = sinon.spy();
    renderCurriculumExpandedCard({
      ...defaultProps,
      onClose: onClose,
    });

    expect(onClose).not.to.have.been.called;

    const onCloseButton = screen.getByRole('button', {
      name: 'Close Button',
      hidden: true,
    });

    fireEvent.click(onCloseButton);
    expect(onClose).to.have.been.calledOnce;
  });

  it('renders curriculum details button with descriptive label', () => {
    renderCurriculumExpandedCard();

    screen.getByLabelText(
      new RegExp(`View details about ${defaultProps.courseDisplayName}`)
    );
  });

  it('renders Assign button for signed out user', () => {
    renderCurriculumExpandedCard({
      ...defaultProps,
      isSignedOut: true,
      isTeacher: false,
    });
    screen.getByText('Assign to class sections');
  });

  it('renders Assign button for teacher', () => {
    renderCurriculumExpandedCard();
    screen.getByText('Assign to class sections');
  });

  it('does not render Assign button for student', () => {
    renderCurriculumExpandedCard({...defaultProps, isTeacher: false});
    expect(screen.queryByText('Assign to class sections')).to.be.null;
  });

  it('renders Professional Learning section for signed out user', () => {
    const professional_learning_program = 'https://code.org/apply';
    const self_paced_pl_course_offering_path = '/courses/vpl-csa-2023';
    renderCurriculumExpandedCard({
      ...defaultProps,
      professionalLearningProgram: professional_learning_program,
      selfPacedPlCourseOfferingPath: self_paced_pl_course_offering_path,
      isSignedOut: true,
      isTeacher: false,
    });
    screen.getByText('Professional Learning');
  });

  it('renders Professional Learning section for teacher', () => {
    const professional_learning_program = 'https://code.org/apply';
    const self_paced_pl_course_offering_path = '/courses/vpl-csa-2023';
    renderCurriculumExpandedCard({
      ...defaultProps,
      professionalLearningProgram: professional_learning_program,
      selfPacedPlCourseOfferingPath: self_paced_pl_course_offering_path,
    });
    screen.getByText('Professional Learning');
  });

  it('does not render Professional Learning section for student', () => {
    const professional_learning_program = 'https://code.org/apply';
    const self_paced_pl_course_offering_path = '/courses/vpl-csa-2023';
    renderCurriculumExpandedCard({
      ...defaultProps,
      professionalLearningProgram: professional_learning_program,
      selfPacedPlCourseOfferingPath: self_paced_pl_course_offering_path,
      isTeacher: false,
    });
    expect(screen.queryByText('Professional Learning')).to.be.null;
  });
});
