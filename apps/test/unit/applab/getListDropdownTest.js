import {expect} from '../../util/configuredChai';

var getListDropdown = require('@cdo/apps/applab/getListDropdown');

describe('getListDropdown', function() {
  var getColumnsForTable = getListDropdown.__TestInterface.getColumnsForTable;
  it('getColumnsForTable', function() {
    expect(getColumnsForTable('"NonExistentTable"')).to.deep.equal([]);
    expect(getColumnsForTable('"words"')).to.deep.equal([
      'Word',
      'Part of Speech',
      'Frequency',
      'Rank'
    ]);
    expect(getColumnsForTable('"weather"')).to.deep.equal([
      'City',
      'Date',
      'Low Temp',
      'High Temp',
      'Condition',
      'Icon'
    ]);
  });
});
