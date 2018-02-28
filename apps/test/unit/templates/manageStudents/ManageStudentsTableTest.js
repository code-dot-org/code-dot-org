import {expect} from '../../../util/configuredChai';
import {sortRows} from '@cdo/apps/templates/manageStudents/ManageStudentsTable';

describe('ManageStudentsTable', () => {
  it('sortRows orders table in the following order: addRow, newStudentRow, other', () => {
    const rowData = [
      {id: 1, name: 'studentb'},
      {id: 3, name: 'studenta'},
      {id: 0, name: '', isAddRow: true},
      {id: 2, name: 'studentf', isNewStudentRow: true}
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
