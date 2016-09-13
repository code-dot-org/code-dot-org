import { expect } from '../../util/configuredChai';
import FirebaseStorage from '@cdo/apps/applab/firebaseStorage';
import { getDatabase, getConfigRef } from '@cdo/apps/applab/firebaseUtils';

describe('FirebaseStorage', () => {
  beforeEach(() => {
    window.Applab = Object.assign({}, window.Applab, {
      channelId: "test-firebase-channel-id",
      firebaseName: 'test-firebase-name',
      firebaseAuthToken: 'test-firebase-auth-token',
    });
    getDatabase(Applab.channelId).autoFlush();
    return getConfigRef().set({
      limits: {
        '15': 5,
        '60': 10
      },
      maxRecordSize: 100,
      maxPropertySize: 100,
      maxTableRows: 20,
      maxTableCount: 3
    }).then(() => {
      getDatabase(Applab.channelId).set(null);
    });
  });

  describe('setKeyValue', () => {
    it('sets a string value', done => {
      FirebaseStorage.setKeyValue(
        'key',
        'val',
        verifyStringValue,
        error => console.warn(error));

      function verifyStringValue() {
        getDatabase(Applab.channelId).child(`storage/keys`)
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.deep.equal({'key': '"val"'});
            done();
          });
      }
    });

    it('sets a number value', done => {
      FirebaseStorage.setKeyValue(
        'key',
        7,
        verifyNumberValue,
        error => console.warn(error));

      function verifyNumberValue() {
        getDatabase(Applab.channelId).child(`storage/keys`)
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.deep.equal({'key': '7'});
            done();
          });
      }
    });

    it('sets and gets an undefined value', done => {
      FirebaseStorage.setKeyValue(
        'key',
        undefined,
        verifySetKeyValue,
        error => console.warn(error));

      function verifySetKeyValue() {
        getDatabase(Applab.channelId).child(`storage/keys`)
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.equal(null);
            FirebaseStorage.getKeyValue(
              'key',
              verifyGetKeyValue,
              error => console.warn(error));
          });
      }

      function verifyGetKeyValue(actualValue) {
        expect(actualValue).to.equal(undefined);
        done();
      }
    });
  });

  describe('createRecord', () => {
    it('creates a record', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {name: 'bob', age: 8},
        () => {
          getDatabase(Applab.channelId).child(`storage/tables/${'mytable'}/records`)
            .once('value')
            .then(snapshot => {
              expect(snapshot.val()).to.deep.equal({1:'{"name":"bob","age":8,"id":1}'});
              done();
            });
        },
        error => {throw error;});
    });

    it('cant create more than maxTableCount tables', done => {
      FirebaseStorage.createRecord(
        'table1',
        {name: 'bob'},
        createTable2,
        error => {throw error;});

      function createTable2() {
        FirebaseStorage.createRecord(
          'table2',
          {name: 'bob'},
          createTable3,
          error => {throw error;});
      }

      function createTable3() {
        FirebaseStorage.createRecord(
          'table3',
          {name: 'bob'},
          createTable4,
          error => {throw error;});
      }

      function createTable4() {
        FirebaseStorage.createRecord(
          'table4',
          {name: 'bob'},
          () => {throw "unexpectedly allowed to create 4th table";},
          error => {
            expect(error.indexOf('maximum number of tables') !== -1).to.be.true;
            done();
          });
      }
    });

  });

  describe('deleteRecord', () => {
    it('deletes a record', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {name: 'bob', age: 8},
        deleteRecord,
        error => {throw error;});

      function deleteRecord(record) {
        expect(record.id).to.equal(1);
        FirebaseStorage.deleteRecord(
          'mytable',
          record,
          handleDelete,
          error => {throw error;});
      }

      function handleDelete(status) {
        expect(status).to.equal(true);
        getDatabase(Applab.channelId).child(`storage/tables/${'mytable'}/records`)
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.equal(null);
            done();
          });
      }
    });

    it('deletes a record when row count is zero', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {name: 'bob', age: 8},
        zeroRowCount,
        error => {throw error;});

      const rowCountRef = getDatabase(Applab.channelId)
        .child(`counters/tables/${'mytable'}/rowCount`);


      function zeroRowCount(record) {
        rowCountRef.once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.equal(1);
          }).then(() => {
            return rowCountRef.set(0);
          }).then(
            () => deleteRecord(record),
            error => {throw error;});
      }

      function deleteRecord(record) {
        expect(record.id).to.equal(1);
        FirebaseStorage.deleteRecord(
          'mytable',
          record,
          handleDelete,
          error => {throw error;});
      }

      function handleDelete(status) {
        expect(status).to.equal(true);
        getDatabase(Applab.channelId).child(`storage/tables/${'mytable'}/records`)
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.equal(null);
            validateRowCount();
          });
      }

      function validateRowCount() {
        rowCountRef.once('value').then(snapshot => {
          // MockFirebase doesn't enforce security rules, so explicitly verify that the
          // row count is set to a legal value.
          expect(snapshot.val()).to.equal(0);
          done();
        });
      }
    });
  });

  /**
   * Verifies the table has no records but that an entry for it exists in counters,
   * then calls the callback.
   * @param {function} callback
   */
  function verifyEmptyTable(callback) {
    const rowCountRef = getDatabase(Applab.channelId).child('counters/tables/mytable/rowCount');
    rowCountRef.once('value').then(snapshot => {
      expect(snapshot.val()).to.equal(0);
      const recordsRef = getDatabase(Applab.channelId).child('storage/tables/mytable/records');
      return recordsRef.once('value');
    }).then(snapshot => {
      expect(snapshot.val()).to.equal(null);
      callback();
    });
  }

  describe('createTable', () => {
    it('creates a table but not a record', done => {
      FirebaseStorage.createTable(
        'mytable',
        () => verifyEmptyTable(done),
        error => {throw error;});
    });

    it('cant create more than maxTableCount tables', done => {
      FirebaseStorage.createTable(
        'table1',
        createTable2,
        error => {throw error;});

      function createTable2() {
        FirebaseStorage.createTable(
          'table2',
          createTable3,
          error => {throw error;});
      }

      function createTable3() {
        FirebaseStorage.createTable(
          'table3',
          createTable4,
          error => {throw error;});
      }

      function createTable4() {
        FirebaseStorage.createTable(
          'table4',
          () => {throw "unexpectedly allowed to create 4th table";},
          error => {
            expect(error.indexOf('maximum number of tables') !== -1).to.be.true;
            done();
          });
      }
    });
  });

  describe('clearTable', () => {
    it ('deletes records but not the table', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {name: 'bob', age: 8},
        clearTable,
        error => {throw error;});

      function clearTable() {
        FirebaseStorage.clearTable(
          'mytable',
          () => verifyEmptyTable(done),
          error => {throw error;});
      }
    });
  });

  describe('deleteTable', () => {
    it('deletes the records and the table', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {name: 'bob', age: 8},
        deleteTable,
        error => {throw error;});

      function deleteTable() {
        FirebaseStorage.deleteTable(
          'mytable',
          verifyNoTable,
          error => {throw error;});
      }

      function verifyNoTable() {
        const countersRef = getDatabase(Applab.channelId).child('counters/tables/mytable');
        countersRef.once('value').then(snapshot => {
          expect(snapshot.val()).to.equal(null);
          const recordsRef = getDatabase(Applab.channelId).child('storage/tables/mytable/records');
          return recordsRef.once('value');
        }).then(snapshot => {
          expect(snapshot.val()).to.equal(null);
          done();
        });
      }
    });
  });

  describe('populateTable', () => {
    const EXISTING_TABLE_DATA = {
      cities: {
        records: {
          1: '{"city":"New York","state":"NY","id":1}'
        }
      }
    };
    const NEW_TABLE_DATA_JSON = `{
      "cities": [
        {"city": "Seattle", "state": "WA"},
        {"city": "Chicago", "state": "IL"}
      ]
    }`;
    const NEW_TABLE_DATA = {
      cities: {
        records: {
          1: '{"city":"Seattle","state":"WA","id":1}',
          2: '{"city":"Chicago","state":"IL","id":2}',
        }
      }
    };

    function verifyTable(expectedTablesData) {
      return getDatabase(Applab.channelId).child(`storage/tables`).once('value')
        .then(snapshot => {
          expect(snapshot.val()).to.deep.equal(expectedTablesData);
        }, error => {throw error;});
    }

    it('loads new table data when no previous data exists', done => {
      const overwrite = false;
      FirebaseStorage.populateTable(
        NEW_TABLE_DATA_JSON,
        overwrite,
        () => verifyTable(NEW_TABLE_DATA).then(done),
        error => {throw error;});
    });

    it('does not overwrite existing data when overwrite is false', done => {
      const overwrite = false;
      getDatabase(Applab.channelId).child(`storage/tables`).set(EXISTING_TABLE_DATA)
        .then(() => {
          FirebaseStorage.populateTable(
            NEW_TABLE_DATA_JSON,
            overwrite,
            () => verifyTable(EXISTING_TABLE_DATA).then(done),
            error => {throw error;});

        });
    });

    it('does overwrite existing data when overwrite is true', done => {
      const overwrite = true;
      getDatabase(Applab.channelId).child(`storage/tables`).set(EXISTING_TABLE_DATA)
        .then(() => {
          FirebaseStorage.populateTable(
            NEW_TABLE_DATA_JSON,
            overwrite,
            () => verifyTable(NEW_TABLE_DATA).then(done),
            error => {throw error;});

        });
    });
  });

  describe('populateKeyValue', () => {
    const EXISTING_KEY_VALUE_DATA = {
      "click_count": "1"
    };
    const NEW_KEY_VALUE_DATA_JSON = `{
        "click_count": 5
      }`;
    const NEW_KEY_VALUE_DATA = {
      "click_count": "5"
    };

    function verifyKeyValue(expectedData) {
      return getDatabase(Applab.channelId).child(`storage/keys`).once('value')
        .then(snapshot => {
          expect(snapshot.val()).to.deep.equal(expectedData);
        }, error => {throw error;});
    }

    it('loads new key value data when no previous data exists', done => {
      const overwrite = false;
      FirebaseStorage.populateKeyValue(
        NEW_KEY_VALUE_DATA_JSON,
        overwrite,
        () => verifyKeyValue(NEW_KEY_VALUE_DATA).then(done),
        error => {throw error;});
    });

    it('does not overwrite existing data when overwrite is false', done => {
      const overwrite = false;
      getDatabase(Applab.channelId).child(`storage/keys`).set(EXISTING_KEY_VALUE_DATA)
        .then(() => {
          FirebaseStorage.populateKeyValue(
            NEW_KEY_VALUE_DATA_JSON,
            overwrite,
            () => verifyKeyValue(EXISTING_KEY_VALUE_DATA).then(done),
            error => {throw error;});

        });
    });

    it('does overwrite existing data when overwrite is true', done => {
      const overwrite = true;
      getDatabase(Applab.channelId).child(`storage/keys`).set(EXISTING_KEY_VALUE_DATA)
        .then(() => {
          FirebaseStorage.populateKeyValue(
            NEW_KEY_VALUE_DATA_JSON,
            overwrite,
            () => verifyKeyValue(NEW_KEY_VALUE_DATA).then(done),
            error => {throw error;});
        });
    });
  });

  describe('importCsv', () => {
    const csvData =
      'id,name,age,male\n' +
      '4,alice,7,false\n' +
      '5,bob,8,true\n' +
      '6,charlie,9,true\n';

    const expectedTableData = {
      1: '{"id":1,"name":"alice","age":7,"male":false}',
      2: '{"id":2,"name":"bob","age":8,"male":true}',
      3: '{"id":3,"name":"charlie","age":9,"male":true}'
    };

    it('imports a valid csv', done => {
      FirebaseStorage.importCsv(
        'mytable',
        csvData,
        validateTableData,
        error => {throw error;});

      function validateTableData() {
        const rowCountRef = getDatabase(Applab.channelId).child('counters/tables/mytable/rowCount');
        rowCountRef.once('value').then(snapshot => {
          expect(snapshot.val()).to.equal(3);
          const recordsRef = getDatabase(Applab.channelId).child('storage/tables/mytable/records');
          return recordsRef.once('value');
        }).then(snapshot => {
          expect(snapshot.val()).to.deep.equal(expectedTableData);
          done();
        });
      }
    });

    it('overwrites existing data', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {name:"eve", age:11, male:false},
        doImport,
        error => {throw error;});

      function doImport() {
        FirebaseStorage.importCsv(
        'mytable',
        csvData,
        validateTableData,
        error => {throw error;});
      }

      function validateTableData() {
        const rowCountRef = getDatabase(Applab.channelId).child('counters/tables/mytable/rowCount');
        rowCountRef.once('value').then(snapshot => {
          expect(snapshot.val()).to.equal(3);
          const recordsRef = getDatabase(Applab.channelId).child('storage/tables/mytable/records');
          return recordsRef.once('value');
        }).then(snapshot => {
          expect(snapshot.val()).to.deep.equal(expectedTableData);
          done();
        });
      }
    });

    it('rejects long inputs', done => {
      const name150 = 'abcdefghij'.repeat(15);
      expect(name150.length).to.equal(150);
      const longCsvData = `name\n${name150}\n`;
      FirebaseStorage.importCsv(
        'mytable',
        longCsvData,
        () => { throw 'expected import to fail on large record'; },
        error => {
          expect(error).to.contain('one of of the records is too large');
          done();
        });
    });

    it('rejects too many rows', done => {
      const longCsvData = 'name\n' + 'bob\n'.repeat(25);
      FirebaseStorage.importCsv(
        'mytable',
        longCsvData,
        () => { throw 'expected import to fail on large table'; },
        error => {
          expect(error).to.contain('the data is too large');
          done();
        });
    });

  });
});
