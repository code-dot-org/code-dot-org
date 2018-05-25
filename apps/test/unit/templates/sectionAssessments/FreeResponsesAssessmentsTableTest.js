import React from 'react';
import {mount} from 'enzyme';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import FreeResponsesAssessments from '@cdo/apps/templates/sectionAssessments/FreeResponsesAssessments';
import i18n from '@cdo/locale';

const questionOne = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: ' ',
  },
  {
    id: 2,
    studentId: '211',
    name: 'Maddie',
    response: `As trees get older they lose their chlorophyll. In painting, you have unlimited power.
        You have the ability to move mountains. You can bend rivers. But when I get home, the only thing
        I have power over is the garbage.,`
  },
  {
    id: 3,
    studentId: '212',
    name: 'Erin',
    response: 'Go out on a limb - that is where the fruit is.',
  },
  {
    id: 4,
    studentId: '213',
    name: 'Brendan',
    response: `We do not make mistakes we just have happy little accidents. Once you learn the technique,
        ohhh! Turn you loose on the world; you become a tiger.,`
  },
];

const questionTwo = [
  {
    id: 1,
    studentId: '210',
    name: 'Maddie',
    response: ' ',
  },
];

describe('FreeResponsesAssessments', () => {
  it('renders the correct number of cells', () => {
    const wrapper = mount(
      <FreeResponsesAssessments
        freeResponses={questionOne}
      />
    );

    // const answerCells = wrapper.find('freeResponsesAssessments');
    // expect(answerCells).to.have.length(8);

    const tableHeaders = wrapper.find('th');
    expect(tableHeaders).to.have.length(2);

    const tableRows = wrapper.find('tr');
    expect(tableRows).to.have.length(5);
  });
});

// describe('FreeResponsesAssessments', () => {
//   it('renders the FreeResponsesAssessmentsTable', () => {
//     const wrapper = shallow(
//       <FreeResponsesAssessments
//         freeResponses={questionOne}
//       />
//     );

//     expect(wrapper.find('FreeResponsesAssessments').exists()).to.be.true;
//   });
// });

