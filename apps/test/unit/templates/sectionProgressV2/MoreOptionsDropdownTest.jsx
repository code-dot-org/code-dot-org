import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {UnconnectedMoreOptionsDropdown as MoreOptionsDropdown} from '@cdo/apps/templates/sectionProgressV2/MoreOptionsDropdown';
import i18n from '@cdo/locale';

describe('MoreOptionsDropdown', () => {
  const students = [
    {id: 1, name: 'Student1'},
    {id: 2, name: 'Student2'},
  ];
  let expandMetadataForStudents;
  let collapseMetadataForStudents;

  beforeEach(() => {
    expandMetadataForStudents = jest.fn();
    collapseMetadataForStudents = jest.fn();
  });

  const renderComponent = () =>
    render(
      <MoreOptionsDropdown
        students={students}
        expandMetadataForStudents={expandMetadataForStudents}
        collapseMetadataForStudents={collapseMetadataForStudents}
      />
    );

  it('renders the trigger button and both menu options', () => {
    renderComponent();

    expect(
      screen.getByRole('button', {name: i18n.additionalOptions()})
    ).toBeTruthy();
    expect(screen.getByText(i18n.expandAll())).toBeTruthy();
    expect(screen.getByText(i18n.collapseAll())).toBeTruthy();
  });

  it('calls expandMetadataForStudents when expand-all is clicked', () => {
    renderComponent();

    const trigger = screen.getByRole('button', {
      name: i18n.additionalOptions(),
    });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText(i18n.expandAll()));

    expect(expandMetadataForStudents).toHaveBeenCalledTimes(1);
    expect(expandMetadataForStudents).toHaveBeenCalledWith([1, 2]);
  });

  it('calls collapseMetadataForStudents when collapse-all is clicked', () => {
    renderComponent();

    const trigger = screen.getByRole('button', {
      name: i18n.additionalOptions(),
    });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText(i18n.collapseAll()));

    expect(collapseMetadataForStudents).toHaveBeenCalledTimes(1);
    expect(collapseMetadataForStudents).toHaveBeenCalledWith([1, 2]);
  });
});
