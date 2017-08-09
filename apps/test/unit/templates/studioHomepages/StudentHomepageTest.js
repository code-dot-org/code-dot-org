import React from 'react';
import { assert, expect } from 'chai';
import { shallow } from 'enzyme';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';

const sections = [
  {
    name: "Period 1",
    teacherName: "Ms. Frizzle",
    linkToProgress: "https://code.org/teacher-dashboard#/sections/111111/progress",
    assignedTitle: "Course 1",
    linkToAssigned: "https://studio.code.org/s/course1",
    numberOfStudents: 1,
    linkToStudents: "https://code.org/teacher-dashboard#/sections/111111/manage",
    code: "ABCDEF"
  },
  {
    name: "Period 2",
    teacherName: "Ms. Frizzle",
    linkToProgress: "https://code.org/teacher-dashboard#/sections/222222/progress",
    assignedTitle: "Course 2",
    linkToAssigned: "https://studio.code.org/s/course2",
    numberOfStudents: 2,
    linkToStudents: "https://code.org/teacher-dashboard#/sections/222222/manage",
    code: "EEBSKR"
  },
];

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

const studentTopCourse = {
  assignableName: "Course 1",
  lessonName: "Lesson 3: Learn to drag and drop",
  linkToOverview: "http://localhost-studio.code.org:3000/s/course1",
  linkToLesson: "http://localhost-studio.code.org:3000/s/course1/stage/3/puzzle/1"
};

describe('TeacherHomepage', () => {

  it('shows a non-extended Header Banner that says Home', () => {
    const wrapper = shallow(
      <StudentHomepage
        courses={[]}
        studentTopCourse={studentTopCourse}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
        canLeave={false}
      />
    );
    const headerBanner = wrapper.find('HeaderBanner');
    assert.deepEqual(headerBanner.props(), {
      headingText: "Home",
      short: true
    });
  });

  it('references a ProtectedStatefulDiv for flashes', () => {
    const wrapper = shallow(
      <StudentHomepage
        courses={[]}
        studentTopCourse={studentTopCourse}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
        canLeave={false}
      />
    );
    expect(wrapper.find('ProtectedStatefulDiv').exists());
  });

  it('shows RecentCourses component', () => {
    const wrapper = shallow(
      <StudentHomepage
        courses={courses}
        studentTopCourse={studentTopCourse}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
        canLeave={false}
      />
    );
    const recentCourses = wrapper.find('RecentCourses');
    assert.deepEqual(recentCourses.props(), {
      courses: courses,
      studentTopCourse: studentTopCourse,
      isTeacher: false,
      isRtl: false,
    });
  });

  it('shows ProjectWidgetWithData component', () => {
    const wrapper = shallow(
      <StudentHomepage
        courses={courses}
        studentTopCourse={studentTopCourse}
        sections={sections}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
        canLeave={false}
      />
    );
    expect(wrapper.find('ProjectWidgetWithData').exists());
  });

  it('shows a StudentSections component', () => {
    const wrapper = shallow(
      <StudentHomepage
        courses={courses}
        studentTopCourse={studentTopCourse}
        sections={sections}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
        canLeave={false}
      />
    );
    const studentSections = wrapper.find('StudentSections');
    assert.deepEqual(studentSections.props(), {
      initialSections: sections,
      isRtl: false,
      canLeave: false
    });
  });
});
