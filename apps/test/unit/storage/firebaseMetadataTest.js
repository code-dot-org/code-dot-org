import {expect} from '../../util/configuredChai';
import {
  addColumnName,
  deleteColumnName,
  renameColumnName,
  getColumnNames,
  onColumnNames
} from '@cdo/apps/storage/firebaseMetadata';
import {
  init,
  getProjectDatabase,
  getConfigRef
} from '@cdo/apps/storage/firebaseUtils';

describe('firebaseMetadata', () => {
  beforeEach(() => {
    init({
      channelId: 'test-firebase-channel-id',
      firebaseName: 'test-firebase-name',
      firebaseAuthToken: 'test-firebase-auth-token',
      showRateLimitAlert: () => {}
    });
    getProjectDatabase().autoFlush();
    return getConfigRef()
      .set({
        limits: {
          '15': 5,
          '60': 10
        },
        maxRecordSize: 100,
        maxPropertySize: 100,
        maxTableRows: 20,
        maxTableCount: 3
      })
      .then(() => {
        getProjectDatabase().set(null);
      });
  });

  it('adds column names', done => {
    getColumnNames('mytable')
      .then(columnNames => {
        expect(columnNames).to.deep.equal([]);
        return addColumnName('mytable', 'foo');
      })
      .then(() => getColumnNames('mytable'))
      .then(columnNames => {
        expect(columnNames).to.deep.equal(['foo']);
        return addColumnName('mytable', 'bar');
      })
      .then(() => getColumnNames('mytable'))
      .then(columnNames => {
        expect(columnNames).to.deep.equal(['foo', 'bar']);
        done();
      });
  });

  it('renames column names', done => {
    addColumnName('mytable', 'foo')
      .then(() => addColumnName('mytable', 'bar'))
      .then(() => renameColumnName('mytable', 'bar', 'baz'))
      .then(() => getColumnNames('mytable'))
      .then(columnNames => {
        expect(columnNames).to.deep.equal(['foo', 'baz']);
        done();
      });
  });

  it('deletes column names', done => {
    addColumnName('mytable', 'foo')
      .then(() => addColumnName('mytable', 'bar'))
      .then(() => deleteColumnName('mytable', 'foo'))
      .then(() => getColumnNames('mytable'))
      .then(columnNames => {
        expect(columnNames).to.deep.equal(['bar']);
        done();
      });
  });

  it('listens to column names', done => {
    let count = 0;
    const expectedNames = [
      [],
      ['foo'],
      ['foo', 'bar'],
      ['foo', 'baz'],
      ['baz']
    ];
    onColumnNames(getProjectDatabase(), 'mytable', columnNames => {
      expect(columnNames).to.deep.equal(expectedNames[count]);
      count++;
      if (count === expectedNames.length) {
        done();
      }
    });
    addColumnName('mytable', 'foo')
      .then(() => addColumnName('mytable', 'bar'))
      .then(() => renameColumnName('mytable', 'bar', 'baz'))
      .then(() => deleteColumnName('mytable', 'foo'));
  });
});
