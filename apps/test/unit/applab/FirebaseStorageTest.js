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
      maxTableRows: 20
    }).then(() => {
      getDatabase(Applab.channelId).set(null);
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
});
