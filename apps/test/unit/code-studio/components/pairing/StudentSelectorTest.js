import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import StudentSelector from '@cdo/apps/code-studio/components/pairing/StudentSelector';
import i18n from '@cdo/locale';

describe('StudentSelector', () => {
  const students = [
    {id: 1, name: 'a'},
    {id: 2, name: 'b'},
    {id: 3, name: 'c'},
    {id: 4, name: 'd'},
    {id: 5, name: 'e'},
  ];

  it('renders nothing when students prop is null', () => {
    const {container} = render(
      <StudentSelector
        students={null}
        selectedStudentIds={[]}
        onSelectionChange={() => {}}
        maxSelections={4}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders empty-section message when students list is empty', () => {
    render(
      <StudentSelector
        students={[]}
        selectedStudentIds={[]}
        onSelectionChange={() => {}}
        maxSelections={4}
      />
    );
    expect(screen.getByText(i18n.noStudentsInSection())).toBeInTheDocument();
  });

  it('renders a checkbox for each student and reflects selectedStudentIds', () => {
    render(
      <StudentSelector
        students={students}
        selectedStudentIds={[1, 3]}
        onSelectionChange={() => {}}
        maxSelections={4}
      />
    );
    expect(screen.getByRole('checkbox', {name: 'a'})).toBeChecked();
    expect(screen.getByRole('checkbox', {name: 'b'})).not.toBeChecked();
    expect(screen.getByRole('checkbox', {name: 'c'})).toBeChecked();
  });

  it('calls onSelectionChange with the toggled student id (as numbers)', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    render(
      <StudentSelector
        students={students}
        selectedStudentIds={[]}
        onSelectionChange={onSelectionChange}
        maxSelections={4}
      />
    );
    await user.click(screen.getByRole('checkbox', {name: 'b'}));
    expect(onSelectionChange).toHaveBeenCalledWith([2]);
  });

  it('ignores selections beyond maxSelections', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    render(
      <StudentSelector
        students={students}
        selectedStudentIds={[1, 2, 3, 4]}
        onSelectionChange={onSelectionChange}
        maxSelections={4}
      />
    );
    await user.click(screen.getByRole('checkbox', {name: 'e'}));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
