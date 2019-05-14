import {expect} from '../../util/configuredChai';

var getListDropdown = require('@cdo/apps/applab/getListDropdown');

describe('getListDropdown', function() {
  var getColumnsForTable = getListDropdown.__TestInterface.getColumnsForTable;
  const testDatasets = [
    {name: 'dataset1', columns: 'column1,column2,column3'},
    {name: 'dataset2', columns: 'column3,column4,column5,column6,column7'}
  ];
  it('getColumnsForTable', function() {
    expect(
      getColumnsForTable('"NonExistentTable"', testDatasets)
    ).to.deep.equal([]);
    expect(getColumnsForTable('"dataset1"', testDatasets)).to.deep.equal([
      'column1',
      'column2',
      'column3'
    ]);
    expect(getColumnsForTable('"dataset2"', testDatasets)).to.deep.equal([
      'column3',
      'column4',
      'column5',
      'column6',
      'column7'
    ]);
  });
});
