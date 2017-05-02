import React from 'react';
import { expect, assert } from 'chai';
import { shallow } from 'enzyme';
import  CourseCard from '@cdo/apps/templates/teacherHomepage/CourseCard';

describe('CourseCard', () => {
  const noneEnrolled = {
    courseName: "CSP Unit 2 - Digital Information",
    description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
    image: "this is where there will be the source for the photo",
    link: "link to wherever",
    assignedSections: []
  };

  const enrolledOne = {
     ...noneEnrolled,
     assignedSections: ["Section 1"]
   };

  const enrolledMany = {
    ...noneEnrolled,
    assignedSections: ["Section 1", "Section 2", "Section 3"]
  };

  it('does not show an enrollement icon if there are no sections enrolled in the course', () => {
    const wrapper = shallow(
      <CourseCard
        courseName={noneEnrolled.courseName}
        description={noneEnrolled.description}
        image={noneEnrolled.image}
        link={noneEnrolled.link}
        assignedSections={noneEnrolled.assignedSections}
      />
    );
    const enrollementIconContainer = wrapper.props().children[1];
    assert.equal(enrollementIconContainer, undefined);
  });

  it('shows a check icon if at least one section is enrolled in the course', () => {
    const wrapper = shallow(
      <CourseCard
        courseName={enrolledOne.courseName}
        description={enrolledOne.description}
        image={enrolledOne.image}
        link={enrolledOne.link}
        assignedSections={enrolledOne.assignedSections}
      />
    );
    const enrollementIconContainer = wrapper.props().children[1];
    const enrollementIcon = enrollementIconContainer.props.children[0].props;
    assert.equal(enrollementIconContainer.type, 'span');
    assert.equal(enrollementIcon.icon, 'check');
  });

  it('shows a tooltip with the section name if one section is enrolled in the course', () => {
    const wrapper = shallow(
      <CourseCard
        courseName={enrolledOne.courseName}
        description={enrolledOne.description}
        image={enrolledOne.image}
        link={enrolledOne.link}
        assignedSections={enrolledOne.assignedSections}
      />
    );
    const enrollementIconContainer = wrapper.props().children[1];
    const tooltip = enrollementIconContainer.props.children[1].props;
    assert.equal(tooltip.role, 'tooltip');
    assert.equal(tooltip.children.props.children[0], 'Assigned to');
    assert.equal(tooltip.children.props.children[2], enrolledOne.assignedSections[0]);
  });

  it('shows a tooltip with the first 2 section names if multiple sections are enrolled in the course', () => {
    const wrapper = shallow(
      <CourseCard
        courseName={enrolledMany.courseName}
        description={enrolledMany.description}
        image={enrolledMany.image}
        link={enrolledMany.link}
        assignedSections={enrolledMany.assignedSections}
      />
    );
    const enrollementIconContainer = wrapper.props().children[1];
    const tooltip = enrollementIconContainer.props.children[1].props;
    expect(tooltip.role).to.equal('tooltip');
    expect(tooltip.children.props.children[0]).to.equal('Assigned to');
    expect(tooltip.children.props.children[2]).to.equal(enrolledMany.assignedSections.slice(0,2).join(", "));
    expect(tooltip.children.props.children[3]).to.equal(' ...');
  });

});
