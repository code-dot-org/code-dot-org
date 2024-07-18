import {render, screen} from '@testing-library/react';
import React from 'react';

import DCDO from '@cdo/apps/dcdo';
import FreeResponseResponses from '@cdo/apps/templates/levelSummary/FreeResponseResponses';

const RESPONSES = [
  {user_id: 0, text: 'student response 1', student_name: 'student 1'},
  {user_id: 1, text: 'student response 2', student_name: 'student 2'},
  {user_id: 3, text: 'student response 3', student_name: 'student 3'},
  {user_id: 2, text: 'student response 4', student_name: 'student 4'},
  {user_id: 9, text: 'student response 5', student_name: 'student 5'},
];
const DEFAULT_PROPS = {
  responses: RESPONSES,
  showStudentNames: false,
};

describe('FreeResponseResponses', () => {
  const renderDefault = (propOverrides = {}) => {
    const props = {...DEFAULT_PROPS, ...propOverrides};
    return render(<FreeResponseResponses {...props} />);
  };

  it('renders responses', () => {
    DCDO.set('cfu-pin-hide-enabled', true);
    renderDefault();

    expect(screen.getAllByText(/student response [1-5]/)).toHaveLength(
      RESPONSES.length
    );

    const studentNameElements = screen.queryAllByText(/student [1-5]/);
    expect(studentNameElements).toHaveLength(0);
  });

  it('renders responses with names', () => {
    DCDO.set('cfu-pin-hide-enabled', true);
    renderDefault({showStudentNames: true});

    expect(screen.getAllByText(/student response [1-5]/)).toHaveLength(
      RESPONSES.length
    );
    expect(screen.getAllByText(/student [1-5]/)).toHaveLength(RESPONSES.length);
  });
});
