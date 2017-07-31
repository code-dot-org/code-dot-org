import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon';
import {assert} from 'chai';
import {mount, shallow} from 'enzyme';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import teacherSections, {
  setSections,
  serverSectionFromSection
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const announcements = [
  {
    heading: "Go beyond an Hour of Code",
    buttonText: "Go Beyond",
    description: "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
    link: "http://teacherblog.code.org/post/160703303174/coming-soon-access-your-top-resources-with-the"
  },
  {
    heading: "Check out your new teacher homepage",
    buttonText: "Learn More",
    description: "A redesign is underway so you have better access to your top tools and resources. Your sections, courses and links are all readily accessible. Also, there's more teal than ever!",
    link: "http://teacherblog.code.org/post/160703303174/coming-soon-access-your-top-resources-with-the"
  }
];

const sections = [
  {
    id: 11,
    name: "Period 1",
    teacherName: "Ms. Frizzle",
    linkToProgress: "https://code.org/teacher-dashboard#/sections/111111/progress",
    assignedTitle: "Course 1",
    linkToAssigned: "https://studio.code.org/s/course1",
    numberOfStudents: 1,
    linkToStudents: "https://code.org/teacher-dashboard#/sections/111111/manage",
    code: "ABCDEF",
    loginType: 'picture',
    stageExtras: false,
    pairingAllowed: true,
    courseId: null,
    scriptId: null,
  },
  {
    id: 12,
    name: "Period 2",
    teacherName: "Ms. Frizzle",
    linkToProgress: "https://code.org/teacher-dashboard#/sections/222222/progress",
    assignedTitle: "Course 2",
    linkToAssigned: "https://studio.code.org/s/course2",
    numberOfStudents: 2,
    linkToStudents: "https://code.org/teacher-dashboard#/sections/222222/manage",
    code: "EEBSKR",
    loginType: 'picture',
    stageExtras: false,
    pairingAllowed: true,
    courseId: null,
    scriptId: null,
  },
];
const serverSections = sections.map(serverSectionFromSection);

const courses = [
  {
    title: "Course 1",
    description: "Start with Course 1 for early readers. Students will create computer programs that will help them learn to collaborate with others, develop problem-solving skills, and persist through difficult tasks. By the end of this course, students create their very own custom game or story that they can share. Recommended for grades K-1.",
    link: "https://studio.code.org/s/course1",
  },
  {
    title: "Course 2",
    description: "Start with Course 2 for students who can read and have no prior programming experience. In this course students will create programs to solve problems and develop interactive games or stories they can share. Recommended for grades 2-5.",
    link: "https://studio.code.org/s/course2",
  },
];

describe('TeacherHomepage', () => {
  let server;

  beforeEach(stubRedux);
  afterEach(restoreRedux);

  const successResponse = () => [
    200,
    {"Content-Type": "application/json"},
    JSON.stringify({})
  ];
  beforeEach(() => {
    server = sinon.fakeServer.create();
    server.respondWith('POST', '/dashboardapi/courses', successResponse());
    server.respondWith('POST', '/dashboardapi/sections', successResponse());
  });
  afterEach(() => server.restore());

  it('shows a non-extended Header Banner that says Home', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
      />
    );
    const headerBanner = wrapper.childAt(0);
    assert.equal(headerBanner.name(),'HeaderBanner');
    assert.equal(headerBanner.props().headingText, 'Home');
    assert.equal(headerBanner.props().extended, false);
  });

  it('references ProtectedStatefulDiv for the terms reminder', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
      />
    );
    const termsReminderRef = wrapper.childAt(1);
    assert.equal(termsReminderRef.name(),'ProtectedStatefulDiv');
  });

  it('shows one announcement', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[announcements[0]]}
        courses={[]}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
      />
    );
    const announcementsContainer = wrapper.childAt(3).childAt(0);
    assert.equal(announcementsContainer.name(), 'Notification');
    // Check if Announcements receives correct props.
    const announcement = announcementsContainer.props();
    assert.equal(announcement.notice, announcements[0].heading);
    assert.equal(announcement.buttonText, announcements[0].buttonText);
    assert.equal(announcement.details, announcements[0].description);
    assert.equal(announcement.buttonLink, announcements[0].link);
  });

  it('if there are sections, Sections component shows a SectionsTable', () => {
    registerReducers({teacherSections});
    const store = getStore();
    store.dispatch(setSections(serverSections));
    const wrapper = mount(
      <Provider store={store}>
        <TeacherHomepage
          announcements={[]}
          courses={[]}
          sections={sections}
          codeOrgUrlPrefix="http://localhost:3000/"
          isRtl={false}
        />
      </Provider>
    );
    // Check if Sections receives correct props.
    const sectionsContainer = wrapper.childAt(3);
    assert.equal(sectionsContainer.name(),'Connect(Sections)');
    assert.equal(sectionsContainer.props().sections.length, 2);
    const section1 = sectionsContainer.props().sections[0];
    assert.equal(section1.name, sections[0].name);
    assert.equal(section1.linkToProgress, sections[0].linkToProgress);
    assert.equal(section1.assignedTitle, sections[0].assignedTitle);
    assert.equal(section1.linkToAssigned, sections[0].linkToAssigned);
    assert.equal(section1.numberOfStudents, 1);
    assert.equal(section1.linkToStudents, sections[0].linkToStudents);
    assert.equal(section1.code, sections[0].code);
    const section2 = sectionsContainer.props().sections[1];
    assert.equal(section2.name, sections[1].name);
    assert.equal(section2.linkToProgress, sections[1].linkToProgress);
    assert.equal(section2.assignedTitle, sections[1].assignedTitle);
    assert.equal(section2.linkToAssigned, sections[1].linkToAssigned);
    assert.equal(section2.numberOfStudents, 2);
    assert.equal(section2.linkToStudents, sections[1].linkToStudents);
    assert.equal(section2.code, sections[1].code);
    // Check if a ContentContainer is rendered.
    const sectionsContentContainer = sectionsContainer.childAt(0);
    assert.equal(sectionsContentContainer.name(), 'ContentContainer');
    assert.equal(sectionsContentContainer.props().heading, 'Classroom Sections');
    assert.equal(sectionsContentContainer.props().linkText, 'Manage sections');
    assert.equal(sectionsContentContainer.props().link, 'http://localhost:3000//teacher-dashboard#/sections');
    assert.equal(sectionsContentContainer.props().showLink, true);
    // Check if a SectionsTable is rendered.
    const sectionsTable = sectionsContentContainer.find('SectionsTable');
    assert.equal(sectionsTable.childAt(0).name(), 'thead');
    const column1 = sectionsTable.childAt(0).childAt(0).childAt(0);
    assert.equal(column1.text(), 'Section Name');
    const column2 = sectionsTable.childAt(0).childAt(0).childAt(1);
    assert.equal(column2.text(), 'Course');
    const column3 = sectionsTable.childAt(0).childAt(0).childAt(2);
    assert.equal(column3.text(), 'Students');
    const column4 = sectionsTable.childAt(0).childAt(0).childAt(3);
    assert.equal(column4.text(), 'Section Code');
    assert.equal(sectionsTable.childAt(1).name(), 'tbody');
    // Check if a row in the SectionTable is rendered for each section.
    const row1 = sectionsTable.childAt(1).childAt(0);
    assert.equal(row1.childAt(0).text(), sections[0].name);
    assert.equal(row1.childAt(1).text(), sections[0].assignedTitle);
    assert.equal(row1.childAt(2).text(), sections[0].numberOfStudents);
    assert.equal(row1.childAt(3).text(), sections[0].code);
    const row2 = sectionsTable.childAt(1).childAt(1);
    assert.equal(row2.childAt(0).text(), sections[1].name);
    assert.equal(row2.childAt(1).text(), sections[1].assignedTitle);
    assert.equal(row2.childAt(2).text(), sections[1].numberOfStudents);
    assert.equal(row2.childAt(3).text(), sections[1].code);
  });

  it('if there are no sections, Sections component shows SectionsSetUpMessage', () => {
    registerReducers({teacherSections});
    const wrapper = mount(
      <Provider store={getStore()}>
        <TeacherHomepage
          announcements={[]}
          courses={[]}
          sections={[]}
          codeOrgUrlPrefix="http://localhost:3000/"
          isRtl={false}
        />
      </Provider>
    );
    // Check if Sections receives correct props.
    const sectionsContainer = wrapper.childAt(3);
    assert.equal(sectionsContainer.name(),'Connect(Sections)');
    assert.equal(sectionsContainer.props().sections.length, 0);
    // Check if a ContentContainer is rendered.
    const sectionsContentContainer = sectionsContainer.childAt(0);
    assert.equal(sectionsContentContainer.name(), 'ContentContainer');
    assert.equal(sectionsContentContainer.props().heading, 'Classroom Sections');
    assert.equal(sectionsContentContainer.props().linkText, 'Manage sections');
    assert.equal(sectionsContentContainer.props().link, 'http://localhost:3000//teacher-dashboard#/sections');
    assert.equal(sectionsContentContainer.props().showLink, true);

    // Check if a sections SetUpMessage is rendered.
    const sectionsSetUpMessage = sectionsContentContainer.find('SectionsSetUpMessage');
    assert.deepEqual(sectionsSetUpMessage.props(), {
      isRtl: false,
    });
  });

  it('shows RecentCourses component', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={courses}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
      />
    );
    const recentCourses = wrapper.find('RecentCourses');
    assert.deepEqual(recentCourses.props(), {
      showAllCoursesLink: true,
      heading: "Recent Courses",
      isTeacher: true,
      courses: courses,
      isRtl: false
    });
  });
});
