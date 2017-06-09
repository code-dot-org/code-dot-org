import React from 'react';
import { assert, expect } from 'chai';
import { mount } from 'enzyme';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/TeacherHomepage';

const announcements = [
  {
    heading: "first announcement heading",
    buttonText: "first announcement buttonText",
    description: "first announcement description",
    link: "first announcement link"
  },
  {
    heading: "second announcement heading",
    buttonText: "second announcement buttonText",
    description: "second announcement description",
    link: "second announcement link"
  }
];

const courses = [
  {
    name: "Course 1 name",
    description: "Course 1 description",
    link: "Course 1 link",
    assignedSections: []
  },
  {
    name: "Course 2 name",
    description: "Course 2 description",
    link: "Course 2 link",
    assignedSections: []
  },
];

const sections = [
  {
    name: "Section 1 name",
    linkToProgress: "Section 1 link",
    course: "Section 1 course",
    linkToCourse: "Section 1 link to course",
    numberOfStudents: 1,
    linkToStudents: "Section 1 link to students",
    sectionCode: "Section 1 section code"
  },
  {
    name: "Section 2 name",
    linkToProgress: "Section 2 link",
    course: "Section 2 course",
    linkToCourse: "Section 2 link to course",
    numberOfStudents: 2,
    linkToStudents: "Section 2 link to students",
    sectionCode: "Section 2 section code"
  },
];

describe('TeacherHomepage', () => {

  it('shows a non-extended Header Banner that says Home', () => {
    const wrapper = mount(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
      />
    );
    const headerBanner = wrapper.childAt(0);
    assert.equal(headerBanner.name(),'HeaderBanner');
    assert.equal(headerBanner.props().headingText, 'Home');
    assert.equal(headerBanner.props().extended, false);
  });

  it('references ProtectedStatefulDiv for the terms reminder', () => {
    const wrapper = mount(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
      />
    );
    const termsReminderRef = wrapper.childAt(1);
    assert.equal(termsReminderRef.name(),'ProtectedStatefulDiv');
  });

  it('shows one announcement', () => {
    const wrapper = mount(
      <TeacherHomepage
        announcements={[announcements[0]]}
        courses={[]}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
      />
    );
    const announcementsContainer = wrapper.childAt(2);
    assert.equal(announcementsContainer.name(), 'Announcements');
    assert.equal(announcementsContainer.props().announcements.length, 1);
    // Check if Announcements receives correct props.
    const announcement1 = announcementsContainer.props().announcements[0];
    assert.equal(announcement1.heading, 'first announcement heading');
    assert.equal(announcement1.buttonText, 'first announcement buttonText');
    assert.equal(announcement1.description, 'first announcement description');
    assert.equal(announcement1.link, 'first announcement link');
    // Check if a ContentContainer is rendered.
    const contentContainer = announcementsContainer.childAt(0);
    assert.equal(contentContainer.name(), 'ContentContainer');
    assert.equal(contentContainer.props().heading, 'Announcements');
    assert.equal(contentContainer.props().linkText, 'View all announcements');
    assert.equal(contentContainer.props().link, 'http://teacherblog.code.org/');
    assert.equal(contentContainer.props().showLink, true);
    // Check for AnnouncementsCarousel
    const announcementsCarousel = contentContainer.childAt(1).childAt(0);
    // Arrow icons should not render because there is only one announcement.
    expect(announcementsCarousel.childAt(0).childAt(0).name()).to.not.equal('FontAwesome');
  });

  it('shows multiple announcements with arrow icons to click through them', () => {
    const wrapper = mount(
      <TeacherHomepage
        announcements={announcements}
        courses={[]}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
      />
    );
    const announcementsContainer = wrapper.childAt(2);
    assert.equal(announcementsContainer.name(), 'Announcements');
    assert.equal(announcementsContainer.props().announcements.length, 2);
    // Check if Announcements receives correct props.
    const announcement1 = announcementsContainer.props().announcements[0];
    assert.equal(announcement1.heading, 'first announcement heading');
    assert.equal(announcement1.buttonText, 'first announcement buttonText');
    assert.equal(announcement1.description, 'first announcement description');
    assert.equal(announcement1.link, 'first announcement link');
    const announcement2 = announcementsContainer.props().announcements[1];
    assert.equal(announcement2.heading, 'second announcement heading');
    assert.equal(announcement2.buttonText, 'second announcement buttonText');
    assert.equal(announcement2.description, 'second announcement description');
    assert.equal(announcement2.link, 'second announcement link');
    // Check if a ContentContainer is rendered.
    const contentContainer = announcementsContainer.childAt(0);
    assert.equal(contentContainer.name(), 'ContentContainer');
    assert.equal(contentContainer.props().heading, 'Announcements');
    assert.equal(contentContainer.props().linkText, 'View all announcements');
    assert.equal(contentContainer.props().link, 'http://teacherblog.code.org/');
    assert.equal(contentContainer.props().showLink, true);
    // Check for AnnouncementsCarousel
    const announcementsCarousel = contentContainer.childAt(1).childAt(0);
    // Arrow icons should render because there are multiple announcements.
    const leftArrow = announcementsCarousel.childAt(0).childAt(0);
    assert.equal(leftArrow.name(), 'FontAwesome');
    assert.equal(leftArrow.props().icon, 'caret-left');
    const rightArrow = announcementsCarousel.childAt(0).childAt(1);
    assert.equal(rightArrow.name(), 'FontAwesome');
    assert.equal(rightArrow.props().icon, 'caret-right');
  });

  it('if there are courses, RecentCourses component shows CourseCards', () => {
    const wrapper = mount(
      <TeacherHomepage
        announcements={[]}
        courses={courses}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
      />
    );
    const recentCourses = wrapper.childAt(3);
    assert.equal(recentCourses.name(),'RecentCourses');
    assert.equal(recentCourses.props().showAllCoursesLink, true);
    assert.equal(recentCourses.props().heading, 'Recent Courses');
    assert.equal(recentCourses.props().isTeacher, true);
    assert.equal(recentCourses.props().courses.length, 2);
    // Check if RecentCourses receives correct props.
    const course1 = recentCourses.props().courses[0];
    assert.equal(course1.name, 'Course 1 name');
    assert.equal(course1.description, 'Course 1 description');
    assert.equal(course1.link, 'Course 1 link');
    const course2 = recentCourses.props().courses[1];
    assert.equal(course2.name, 'Course 2 name');
    assert.equal(course2.description, 'Course 2 description');
    assert.equal(course2.link, 'Course 2 link');
    // Check if a ContentContainer is rendered.
    const coursesContentContainer = recentCourses.childAt(0);
    assert.equal(coursesContentContainer.name(), 'ContentContainer');
    assert.equal(coursesContentContainer.props().heading, 'Recent Courses');
    assert.equal(coursesContentContainer.props().linkText, 'View all courses');
    assert.equal(coursesContentContainer.props().link, '/courses');
    assert.equal(coursesContentContainer.props().showLink, true);
    // Check if a CourseCards are rendered for each course.
    const course1Card = coursesContentContainer.childAt(1).childAt(0);
    assert.equal(course1Card.name(), 'CourseCard');
    assert.equal(course1Card.childAt(0).type(), 'img');
    assert.equal(course1Card.childAt(1).text(), 'Course 1 name');
    expect(course1Card.childAt(2).text()).to.contain('Course 1 description');
    expect(course1Card.childAt(2).text()).to.contain('View course');
    const course2Card = coursesContentContainer.childAt(2).childAt(0);
    assert.equal(course2Card.name(), 'CourseCard');
    assert.equal(course2Card.childAt(1).text(), 'Course 2 name');
    expect(course2Card.childAt(2).text()).to.contain('Course 2 description');
    expect(course2Card.childAt(2).text()).to.contain('View course');
  });

  it('if there are no courses, RecentCourses component shows a SetUpMessage', () => {
    const wrapper = mount(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
      />
    );
    const recentCourses = wrapper.childAt(3);
    assert.equal(recentCourses.name(),'RecentCourses');
    assert.equal(recentCourses.props().showAllCoursesLink, true);
    assert.equal(recentCourses.props().heading, 'Recent Courses');
    assert.equal(recentCourses.props().isTeacher, true);
    assert.equal(recentCourses.props().courses.length, 0);
    // Check if a ContentContainer is rendered.
    const coursesContentContainer = recentCourses.childAt(0);
    assert.equal(coursesContentContainer.name(), 'ContentContainer');
    assert.equal(coursesContentContainer.props().heading, 'Recent Courses');
    assert.equal(coursesContentContainer.props().linkText, 'View all courses');
    assert.equal(coursesContentContainer.props().link, '/courses');
    assert.equal(coursesContentContainer.props().showLink, true);
    // Check if a courses SetUpMessage is rendered.
    const coursesSetUpMessage = coursesContentContainer.childAt(1).childAt(0);
    assert.equal(coursesSetUpMessage.name(), 'SetUpMessage');
    assert.equal(coursesSetUpMessage.props().type, 'courses');
    assert.equal(coursesSetUpMessage.childAt(0).text(), 'Start learning');
    assert.equal(coursesSetUpMessage.childAt(1).text(), 'Assign a course to your classroom or start your own course.');
    assert.equal(coursesSetUpMessage.childAt(2).name(), 'ProgressButton');
    assert.equal(coursesSetUpMessage.childAt(2).props().href, '/courses');
    assert.equal(coursesSetUpMessage.childAt(2).props().text, 'View courses');
  });

  it('if there are sections, Sections component shows a SectionsTable', () => {
    const wrapper = mount(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        sections={sections}
        codeOrgUrlPrefix="http://localhost:3000/"
      />
    );
    // Check if Sections receives correct props.
    const sectionsContainer = wrapper.childAt(4);
    assert.equal(sectionsContainer.name(),'Sections');
    assert.equal(sectionsContainer.props().sections.length, 2);
    const section1 = sectionsContainer.props().sections[0];
    assert.equal(section1.name, 'Section 1 name');
    assert.equal(section1.linkToProgress, 'Section 1 link');
    assert.equal(section1.course, 'Section 1 course');
    assert.equal(section1.linkToCourse, 'Section 1 link to course');
    assert.equal(section1.numberOfStudents, 1);
    assert.equal(section1.linkToStudents, 'Section 1 link to students');
    assert.equal(section1.sectionCode, 'Section 1 section code');
    const section2 = sectionsContainer.props().sections[1];
    assert.equal(section2.name, 'Section 2 name');
    assert.equal(section2.linkToProgress, 'Section 2 link');
    assert.equal(section2.course, 'Section 2 course');
    assert.equal(section2.linkToCourse, 'Section 2 link to course');
    assert.equal(section2.numberOfStudents, 2);
    assert.equal(section2.linkToStudents, 'Section 2 link to students');
    assert.equal(section2.sectionCode, 'Section 2 section code');
    // Check if a ContentContainer is rendered.
    const sectionsContentContainer = sectionsContainer.childAt(0);
    assert.equal(sectionsContentContainer.name(), 'ContentContainer');
    assert.equal(sectionsContentContainer.props().heading, 'Sections');
    assert.equal(sectionsContentContainer.props().linkText, 'View all sections');
    assert.equal(sectionsContentContainer.props().link, 'http://localhost:3000//teacher-dashboard#/sections');
    assert.equal(sectionsContentContainer.props().showLink, true);
    // Check if a SectionsTable is rendered.
    const sectionsTable = sectionsContentContainer.childAt(1).childAt(0);
    assert.equal(sectionsTable.name(), 'SectionsTable');
    assert.equal(sectionsTable.childAt(0).name(), 'thead');
    const column1 = sectionsTable.childAt(0).childAt(0).childAt(0);
    assert.equal(column1.text(), 'Section');
    const column2 = sectionsTable.childAt(0).childAt(0).childAt(1);
    assert.equal(column2.text(), 'Course');
    const column3 = sectionsTable.childAt(0).childAt(0).childAt(2);
    assert.equal(column3.text(), 'Students');
    const column4 = sectionsTable.childAt(0).childAt(0).childAt(3);
    assert.equal(column4.text(), 'Section Code');
    assert.equal(sectionsTable.childAt(1).name(), 'tbody');
    // Check if a row in the SectionTable is rendered for each section.
    const row1 = sectionsTable.childAt(1).childAt(0);
    assert.equal(row1.childAt(0).text(), 'Section 1 name');
    assert.equal(row1.childAt(1).text(), 'Section 1 course');
    assert.equal(row1.childAt(2).text(), 1);
    assert.equal(row1.childAt(3).text(), 'Section 1 section code');
    const row2 = sectionsTable.childAt(1).childAt(1);
    assert.equal(row2.childAt(0).text(), 'Section 2 name');
    assert.equal(row2.childAt(1).text(), 'Section 2 course');
    assert.equal(row2.childAt(2).text(), 2);
    assert.equal(row2.childAt(3).text(), 'Section 2 section code');
  });

  it('if there are no sections, Sections component shows SetUpMessage', () => {
    const wrapper = mount(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
      />
    );
    // Check if Sections receives correct props.
    const sectionsContainer = wrapper.childAt(4);
    assert.equal(sectionsContainer.name(),'Sections');
    assert.equal(sectionsContainer.props().sections.length, 0);
    // Check if a ContentContainer is rendered.
    const sectionsContentContainer = sectionsContainer.childAt(0);
    assert.equal(sectionsContentContainer.name(), 'ContentContainer');
    assert.equal(sectionsContentContainer.props().heading, 'Sections');
    assert.equal(sectionsContentContainer.props().linkText, 'View all sections');
    assert.equal(sectionsContentContainer.props().link, 'http://localhost:3000//teacher-dashboard#/sections');
    assert.equal(sectionsContentContainer.props().showLink, true);
    // Check if a sections SetUpMessage is rendered.
    const sectionsSetUpMessage = sectionsContentContainer.childAt(2).childAt(0);
    assert.equal(sectionsSetUpMessage.name(), 'SetUpMessage');
    assert.equal(sectionsSetUpMessage.props().type, 'sections');
    assert.equal(sectionsSetUpMessage.childAt(0).text(), 'Set up your classroom');
    assert.equal(sectionsSetUpMessage.childAt(1).text(), 'Create a new classroom section to start assigning courses and seeing your student progress.');
    assert.equal(sectionsSetUpMessage.childAt(2).name(), 'ProgressButton');
    assert.equal(sectionsSetUpMessage.childAt(2).props().href, 'http://localhost:3000//teacher-dashboard#/sections');
    assert.equal(sectionsSetUpMessage.childAt(2).props().text, 'Create section');
  });

});
