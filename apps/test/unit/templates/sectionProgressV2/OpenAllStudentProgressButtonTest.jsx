import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import {UnconnectedOpenAllStudentProgressButton as OpenAllStudentProgressButton} from '@cdo/apps/templates/sectionProgressV2/OpenAllStudentProgressButton';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai';

describe('OpenAllStudentProgressButton', () => {
  const students = [
    {id: 1, name: 'Student1'},
    {id: 2, name: 'Student2'},
  ];
  const expandMetadataForStudents = sinon.spy();
  const collapseMetadataForStudents = sinon.spy();

  const renderComponent = () =>
    render(
      <OpenAllStudentProgressButton
        students={students}
        expandMetadataForStudents={expandMetadataForStudents}
        collapseMetadataForStudents={collapseMetadataForStudents}
      />
    );

  it('expands menu when button is clicked', () => {
    renderComponent();

    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    screen.getByText(i18n.expandAll());
    screen.getByText(i18n.collapseAll());
  });

  it('calls expandMetaDataForStudents when option clicked', () => {
    renderComponent();

    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    const expandAllOption = screen.getByText(i18n.expandAll());
    fireEvent.click(expandAllOption);
    expect(expandMetadataForStudents).to.have.been.calledOnce;
    expect(expandMetadataForStudents).to.have.been.calledWith([1, 2]);
  });

  it('calls expandMetaDataForStudents when option clicked', () => {
    renderComponent();

    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    const collapseAllOption = screen.getByText(i18n.collapseAll());
    fireEvent.click(collapseAllOption);
    expect(collapseMetadataForStudents).to.have.been.calledOnce;
    expect(collapseMetadataForStudents).to.have.been.calledWith([1, 2]);
  });
});
