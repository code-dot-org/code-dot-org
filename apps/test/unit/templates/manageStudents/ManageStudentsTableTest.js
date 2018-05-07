import React from 'react';
import {expect} from '../../../util/configuredChai';
import {shallow} from 'enzyme';
import {UnconnectedManageStudentsTable as ManageStudentsTable, sortRows} from '@cdo/apps/templates/manageStudents/ManageStudentsTable';
import {RowType} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

describe('ManageStudentsTable', () => {
  it('sortRows orders table in the following order: add, newStudent, student', () => {
    const rowData = [
      {id: 1, name: 'studentb', rowType: RowType.STUDENT},
      {id: 3, name: 'studenta', rowType: RowType.STUDENT},
      {id: 0, name: '', rowType: RowType.ADD},
      {id: 2, name: 'studentf', rowType: RowType.NEW_STUDENT}
    ];
    const columnIndexList = [];
    const orderList = ["asc"];
    const sortedList = sortRows(rowData, columnIndexList, orderList);
    expect(sortedList[0].id).to.equal(0);
    expect(sortedList[1].id).to.equal(2);
    expect(sortedList[2].id).to.equal(1);
    expect(sortedList[3].id).to.equal(3);
  });

  it('does not render MoveStudents if loginType is google_classroom', () => {
    const wrapper = shallow(
      <ManageStudentsTable
        loginType={SectionLoginType.google_classroom}
        studentData={[]}
        editingData={{}}
        addStatus={{}}
        transferStatus={{}}
      />
    );

    expect(wrapper.find('MoveStudents').exists()).to.be.false;
  });

  it('does not render MoveStudents if loginType is clever', () => {
    const wrapper = shallow(
      <ManageStudentsTable
        loginType={SectionLoginType.clever}
        studentData={[]}
        editingData={{}}
        addStatus={{}}
        transferStatus={{}}
      />
    );

    expect(wrapper.find('MoveStudents').exists()).to.be.false;
  });
});
