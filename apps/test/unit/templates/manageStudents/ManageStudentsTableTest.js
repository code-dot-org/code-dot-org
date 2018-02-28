import {expect} from '../../../util/configuredChai';
import {sortRows} from '@cdo/apps/templates/manageStudents/ManageStudentsTable';
import {ROW_TYPE} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';

describe('ManageStudentsTable', () => {
  it('sortRows orders table in the following order: add, newStudent, student', () => {
    const rowData = [
      {id: 1, name: 'studentb', rowType: ROW_TYPE.student},
      {id: 3, name: 'studenta', rowType: ROW_TYPE.student},
      {id: 0, name: '', rowType: ROW_TYPE.add},
      {id: 2, name: 'studentf', rowType: ROW_TYPE.newStudent}
    ];
    const columnIndexList = [];
    const orderList = ["asc"];
    const sortedList = sortRows(rowData, columnIndexList, orderList);
    expect(sortedList[0].id).to.equal(0);
    expect(sortedList[1].id).to.equal(2);
    expect(sortedList[2].id).to.equal(1);
    expect(sortedList[3].id).to.equal(3);
  });
});
