import {expect} from '../../util/reconfiguredChai';
import {__TestInterface} from '@cdo/apps/storage/getColumnDropdown';

describe('getTableNameFromColumnSocket', () => {
  const makeFakeSocket = function(tableName) {
    return {
      parent: {
        start: {
          type: 'socketStart',
          next: {
            type: 'text',
            // The value in the socket has an extra set of double quotes
            value: `"${tableName}"`
          }
        }
      }
    };
  };
  it('gets the table name from the socket', () => {
    let socket = makeFakeSocket('Table Name');
    let tableName = __TestInterface.getTableNameFromColumnSocket(socket);
    expect(tableName).to.equal('Table Name');
  });

  it('preserves apostrophes in table name', () => {
    let socket = makeFakeSocket("FIFA Women's World Cup Results");
    let tableName = __TestInterface.getTableNameFromColumnSocket(socket);
    expect(tableName).to.equal("FIFA Women's World Cup Results");
  });
});
