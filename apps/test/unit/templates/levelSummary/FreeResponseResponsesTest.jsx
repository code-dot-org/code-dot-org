import {render, screen, within} from '@testing-library/react';
import React from 'react';

import FreeResponseResponses from '@cdo/apps/templates/levelSummary/FreeResponseResponses';

const RESPONSES = [
  {user_id: 0, text: 'student response 1', student_display_name: 'student 1'},
  {user_id: 1, text: 'student response 2', student_display_name: 'student 2'},
  {user_id: 3, text: 'student response 3', student_display_name: 'student 3'},
  {user_id: 2, text: 'student response 4', student_display_name: 'student 4'},
  {
    user_id: 9,
    text: 'student response 5',
    student_display_name: 'student 5',
    student_family_name: 'smith',
  },
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
    renderDefault();

    expect(screen.getAllByText(/student response [1-5]/)).toHaveLength(
      RESPONSES.length
    );

    const studentNameElements = screen.queryAllByText(/student [1-5]/);
    expect(studentNameElements).toHaveLength(0);
  });

  it('renders responses with names', () => {
    renderDefault({showStudentNames: true});

    expect(screen.getAllByText(/student response [1-5]/)).toHaveLength(
      RESPONSES.length
    );
    expect(screen.getAllByText(/student [1-5]/)).toHaveLength(RESPONSES.length);
    // Check that family name is displayed when available
    screen.getByText('student 5 smith');
  });

  it('hides responses', () => {
    renderDefault();

    const studentResp1 = screen.getByText('student response 1');
    const studentResp1Parent = studentResp1.parentNode;

    const dropdownButton =
      within(studentResp1Parent).getByLabelText('Additional options');
    dropdownButton.click();

    const hideResponseButton = within(studentResp1Parent).getByRole('button', {
      name: 'Hide response',
    });
    hideResponseButton.click();

    expect(screen.queryByText('student response 1')).toBeNull();

    const showAllResponsesButton = screen.getByText('Show hidden responses');
    showAllResponsesButton.click();

    screen.getByText('student response 1');
  });

  it('pins and unpins responses', () => {
    renderDefault();

    let student1 = screen.getByText('student response 1');
    let student5 = screen.getByText('student response 5');
    const studentResp5Parent = student5.parentNode;

    expect(student1.compareDocumentPosition(student5)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(screen.queryByText('Pinned responses')).toBeNull();

    // pin response
    const dropdownButton =
      within(studentResp5Parent).getByLabelText('Additional options');
    dropdownButton.click();

    const pinResponseButton = within(studentResp5Parent).getByRole('button', {
      name: 'Pin response',
    });
    pinResponseButton.click();

    student1 = screen.getByText('student response 1');
    student5 = screen.getByText('student response 5');
    expect(student1.compareDocumentPosition(student5)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING
    );
    screen.getByText('Pinned responses');

    // unpin response
    const unpinAll = screen.getByText('Unpin all');
    unpinAll.click();

    screen.getByText('student response 1');

    student1 = screen.getByText('student response 1');
    student5 = screen.getByText('student response 5');
    expect(student1.compareDocumentPosition(student5)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(screen.queryByText('Pinned responses')).toBeNull();
  });
});
