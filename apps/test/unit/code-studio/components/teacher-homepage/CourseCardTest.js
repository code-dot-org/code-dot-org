import React from 'react';
import { mount } from 'enzyme';
import { assert, expect } from 'chai';
import ReactTestUtils from 'react-addons-test-utils';
import  CourseCard from '@cdo/apps/templates/teacherHomepage/CourseCard';

// const EXAMPLE_CARD_DATA = {
//   courseName: "CSP Unit 2 - Digital Information",
//   description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
//   image: "this is where there will be the source for the photo",
//   link: "link to wherever you want the button to go...",
//   assignedSections: []
// };

// const ENROLLED_ONE = {
//    ...EXAMPLE_CARD_DATA,
//    assignedSections: ["Section 1"]
//  };
//
// const ENROLLED_MANY = {
//   ...EXAMPLE_CARD_DATA,
//   assignedSections: ["Section 1", "Section 2", "Section 3"]
// };

describe('a passing test', () => {
  it('should pass', () => {
    expect(true).to.be.true;
  });
});

describe('a rendered div', () => {
  it('renders div with content', () => {
    const component = mount(
      <div>
        Hello World
      </div>
    );
  assert(component.html() !== null);
});

describe('CourseCard component tests', () => {
  let renderer, cardData;

  beforeEach(() => {
    renderer = ReactTestUtils.createRenderer();
    cardData = {
      courseName: "CSP Unit 2 - Digital Information",
      description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
      image: "this is where there will be the source for the photo",
      link: "link to wherever you want the button to go...",
      assignedSections: []
    };
  });

  it('Course Card renders a div', () => {
    const card = (
      <CourseCard
        cardData={cardData}
      />
    );
    renderer.render(card);

    const result = renderer.getRenderOutput();

    expect(result.type).to.equal('div');

    console.log(result);
  }
);


});


});
