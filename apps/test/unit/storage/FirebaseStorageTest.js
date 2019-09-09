import {expect} from '../../util/configuredChai';
import {initFirebaseStorage} from '@cdo/apps/storage/firebaseStorage';
import {
  getProjectDatabase,
  getConfigRef
} from '@cdo/apps/storage/firebaseUtils';

describe('FirebaseStorage', () => {
  let FirebaseStorage;

  beforeEach(() => {
    FirebaseStorage = initFirebaseStorage({
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

  describe('setKeyValue', () => {
    it('sets a string value', done => {
      FirebaseStorage.setKeyValue('key', 'val', verifyStringValue, error =>
        console.warn(error)
      );

      function verifyStringValue() {
        getProjectDatabase()
          .child(`storage/keys`)
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.deep.equal({key: '"val"'});
            done();
          });
      }
    });

    it('sets a number value', done => {
      FirebaseStorage.setKeyValue('key', 7, verifyNumberValue, error =>
        console.warn(error)
      );

      function verifyNumberValue() {
        getProjectDatabase()
          .child(`storage/keys`)
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.deep.equal({key: '7'});
            done();
          });
      }
    });

    it('sets and gets an undefined value', done => {
      FirebaseStorage.setKeyValue('key', undefined, verifySetKeyValue, error =>
        console.warn(error)
      );

      function verifySetKeyValue() {
        getProjectDatabase()
          .child(`storage/keys`)
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.equal(null);
            FirebaseStorage.getKeyValue('key', verifyGetKeyValue, error =>
              console.warn(error)
            );
          });
      }

      function verifyGetKeyValue(actualValue) {
        expect(actualValue).to.equal(undefined);
        done();
      }
    });

    it('fails on key names with ascii control codes', done => {
      FirebaseStorage.setKeyValue(
        'key\n',
        'val',
        () => {
          throw 'unexpectedly allowed key name with ascii control code';
        },
        error => {
          expect(error.indexOf('illegal character code') !== -1).to.be.true;
          verifyNoKeys();
        }
      );

      function verifyNoKeys() {
        getProjectDatabase()
          .child(`storage/keys`)
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.equal(null);
            done();
          });
      }
    });

    it('warns and succeeds on key names with illegal characters', done => {
      let didWarn = false;
      FirebaseStorage.setKeyValue(
        'foo.bar',
        'baz',
        () => verifyValueAndWarning(),
        error => {
          expect(error.indexOf('renamed') !== -1).to.be.true;
          didWarn = true;
        }
      );

      function verifyValueAndWarning() {
        expect(didWarn).to.be.true;
        getProjectDatabase()
          .child(`storage/keys`)
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.deep.equal({'foo-bar': '"baz"'});
            done();
          });
      }
    });
  });

  describe('getKeyValue', () => {
    it('warns and succeeds on keys with invalid characters', done => {
      let didWarn = false;
      FirebaseStorage.setKeyValue('key/slash', 'value7', getKeyValue, () => {});

      function getKeyValue() {
        FirebaseStorage.getKeyValue('key/slash', verifyGetKeyValue, error => {
          expect(error).to.include('renamed');
          didWarn = true;
        });
      }

      function verifyGetKeyValue(actualValue) {
        expect(didWarn).to.be.true;
        expect(actualValue).to.equal('value7');
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
          getProjectDatabase()
            .child(`storage/tables/${'mytable'}/records`)
            .once('value')
            .then(snapshot => {
              expect(snapshot.val()).to.deep.equal({
                1: '{"name":"bob","age":8,"id":1}'
              });
              done();
            });
        },
        error => {
          throw error;
        }
      );
    });

    it('cant create more than maxTableCount tables', done => {
      FirebaseStorage.createRecord(
        'table1',
        {name: 'bob'},
        createTable2,
        error => {
          throw error;
        }
      );

      function createTable2() {
        FirebaseStorage.createRecord(
          'table2',
          {name: 'bob'},
          createTable3,
          error => {
            throw error;
          }
        );
      }

      function createTable3() {
        FirebaseStorage.createRecord(
          'table3',
          {name: 'bob'},
          createTable4,
          error => {
            throw error;
          }
        );
      }

      function createTable4() {
        FirebaseStorage.createRecord(
          'table4',
          {name: 'bob'},
          () => {
            throw 'unexpectedly allowed to create 4th table';
          },
          error => {
            expect(error.indexOf('maximum number of tables') !== -1).to.be.true;
            done();
          }
        );
      }
    });
  });

  describe('deleteRecord', () => {
    it('deletes a record', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {name: 'bob', age: 8},
        deleteRecord,
        error => {
          throw error;
        }
      );

      function deleteRecord(record) {
        expect(record.id).to.equal(1);
        FirebaseStorage.deleteRecord('mytable', record, handleDelete, error => {
          throw error;
        });
      }

      function handleDelete(status) {
        expect(status).to.equal(true);
        getProjectDatabase()
          .child(`storage/tables/${'mytable'}/records`)
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
        error => {
          throw error;
        }
      );

      const rowCountRef = getProjectDatabase().child(
        `counters/tables/${'mytable'}/rowCount`
      );

      function zeroRowCount(record) {
        rowCountRef
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.equal(1);
          })
          .then(() => {
            return rowCountRef.set(0);
          })
          .then(
            () => deleteRecord(record),
            error => {
              throw error;
            }
          );
      }

      function deleteRecord(record) {
        expect(record.id).to.equal(1);
        FirebaseStorage.deleteRecord('mytable', record, handleDelete, error => {
          throw error;
        });
      }

      function handleDelete(status) {
        expect(status).to.equal(true);
        getProjectDatabase()
          .child(`storage/tables/${'mytable'}/records`)
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
    const rowCountRef = getProjectDatabase().child(
      'counters/tables/mytable/rowCount'
    );
    rowCountRef
      .once('value')
      .then(snapshot => {
        expect(snapshot.val()).to.equal(0);
        const recordsRef = getProjectDatabase().child(
          'storage/tables/mytable/records'
        );
        return recordsRef.once('value');
      })
      .then(snapshot => {
        expect(snapshot.val()).to.equal(null);
        callback();
      });
  }

  describe('createTable', () => {
    it('creates a table but not a record', done => {
      FirebaseStorage.createTable(
        'mytable',
        () => verifyEmptyTable(done),
        error => {
          throw error;
        }
      );
    });

    it('cant create more than maxTableCount tables', done => {
      FirebaseStorage.createTable('table1', createTable2, error => {
        throw error;
      });

      function createTable2() {
        FirebaseStorage.createTable('table2', createTable3, error => {
          throw error;
        });
      }

      function createTable3() {
        FirebaseStorage.createTable('table3', createTable4, error => {
          throw error;
        });
      }

      function createTable4() {
        FirebaseStorage.createTable(
          'table4',
          () => {
            throw 'unexpectedly allowed to create 4th table';
          },
          error => {
            expect(error.indexOf('maximum number of tables') !== -1).to.be.true;
            done();
          }
        );
      }
    });
  });

  describe('clearTable', () => {
    it('deletes records but not the table', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {name: 'bob', age: 8},
        clearTable,
        error => {
          throw error;
        }
      );

      function clearTable() {
        FirebaseStorage.clearTable(
          'mytable',
          () => verifyEmptyTable(done),
          error => {
            throw error;
          }
        );
      }
    });
  });

  describe('deleteTable', () => {
    it('deletes the records and the table', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {name: 'bob', age: 8},
        deleteTable,
        error => {
          throw error;
        }
      );

      function deleteTable() {
        FirebaseStorage.deleteTable('mytable', verifyNoTable, error => {
          throw error;
        });
      }

      function verifyNoTable() {
        const countersRef = getProjectDatabase().child(
          'counters/tables/mytable'
        );
        countersRef
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.equal(null);
            const recordsRef = getProjectDatabase().child(
              'storage/tables/mytable/records'
            );
            return recordsRef.once('value');
          })
          .then(snapshot => {
            expect(snapshot.val()).to.equal(null);
            done();
          });
      }
    });
  });

  describe('coerceColumn', () => {
    it('converts anything to a string', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {foo: 1},
        () => {
          FirebaseStorage.createRecord(
            'mytable',
            {foo: 'one'},
            () => {
              FirebaseStorage.createRecord(
                'mytable',
                {foo: '1'},
                () => {
                  FirebaseStorage.createRecord(
                    'mytable',
                    {foo: null},
                    () => {
                      FirebaseStorage.createRecord(
                        'mytable',
                        {foo: undefined},
                        () => {
                          FirebaseStorage.createRecord(
                            'mytable',
                            {foo: false},
                            () => {
                              doCoerce();
                            },
                            error => {
                              throw error;
                            }
                          );
                        },
                        error => {
                          throw error;
                        }
                      );
                    },
                    error => {
                      throw error;
                    }
                  );
                },
                error => {
                  throw error;
                }
              );
            },
            error => {
              throw error;
            }
          );
        },
        error => {
          throw error;
        }
      );

      function doCoerce() {
        FirebaseStorage.coerceColumn(
          'mytable',
          'foo',
          'string',
          validate,
          error => {
            throw error;
          }
        );
      }

      function validate() {
        const recordsRef = getProjectDatabase().child(
          `storage/tables/mytable/records`
        );
        recordsRef.once('value').then(snapshot => {
          expect(snapshot.val()).to.deep.equal({
            1: '{"foo":"1","id":1}',
            2: '{"foo":"one","id":2}',
            3: '{"foo":"1","id":3}',
            4: '{"foo":"null","id":4}',
            // undefined fields are not included in the record during creation and should
            // not get converted to "undefined".
            5: '{"id":5}',
            6: '{"foo":"false","id":6}'
          });
          done();
        });
      }
    });

    it('converts valid booleans', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {foo: true},
        () => {
          FirebaseStorage.createRecord(
            'mytable',
            {foo: 'true'},
            () => {
              FirebaseStorage.createRecord(
                'mytable',
                {foo: false},
                () => {
                  FirebaseStorage.createRecord(
                    'mytable',
                    {foo: 'false'},
                    () => {
                      doCoerce();
                    },
                    error => {
                      throw error;
                    }
                  );
                },
                error => {
                  throw error;
                }
              );
            },
            error => {
              throw error;
            }
          );
        },
        error => {
          throw error;
        }
      );

      function doCoerce() {
        FirebaseStorage.coerceColumn(
          'mytable',
          'foo',
          'boolean',
          validate,
          error => {
            throw error;
          }
        );
      }

      function validate() {
        const recordsRef = getProjectDatabase().child(
          `storage/tables/mytable/records`
        );
        recordsRef.once('value').then(snapshot => {
          expect(snapshot.val()).to.deep.equal({
            1: '{"foo":true,"id":1}',
            2: '{"foo":true,"id":2}',
            3: '{"foo":false,"id":3}',
            4: '{"foo":false,"id":4}'
          });
          done();
        });
      }
    });

    it('converts valid numbers', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {foo: 1},
        () => {
          FirebaseStorage.createRecord(
            'mytable',
            {foo: '2'},
            () => {
              FirebaseStorage.createRecord(
                'mytable',
                {foo: '1e3'},
                () => {
                  FirebaseStorage.createRecord(
                    'mytable',
                    {foo: '0.4'},
                    () => {
                      doCoerce();
                    },
                    error => {
                      throw error;
                    }
                  );
                },
                error => {
                  throw error;
                }
              );
            },
            error => {
              throw error;
            }
          );
        },
        error => {
          throw error;
        }
      );

      function doCoerce() {
        FirebaseStorage.coerceColumn(
          'mytable',
          'foo',
          'number',
          validate,
          error => {
            throw error;
          }
        );
      }

      function validate() {
        const recordsRef = getProjectDatabase().child(
          `storage/tables/mytable/records`
        );
        recordsRef.once('value').then(snapshot => {
          expect(snapshot.val()).to.deep.equal({
            1: '{"foo":1,"id":1}',
            2: '{"foo":2,"id":2}',
            3: '{"foo":1000,"id":3}',
            4: '{"foo":0.4,"id":4}'
          });
          done();
        });
      }
    });

    it('warns on invalid booleans', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {foo: true},
        () => {
          FirebaseStorage.createRecord(
            'mytable',
            {foo: 'bar'},
            () => {
              doCoerce();
            },
            error => {
              throw error;
            }
          );
        },
        error => {
          throw error;
        }
      );

      function doCoerce() {
        FirebaseStorage.coerceColumn(
          'mytable',
          'foo',
          'boolean',
          validate,
          validateError
        );
      }

      let onErrorCalled = false;
      function validateError(msg) {
        expect(msg).to.equal(
          'Not all values in column "foo" could be converted to type "boolean".'
        );
        onErrorCalled = true;
      }

      function validate() {
        const recordsRef = getProjectDatabase().child(
          `storage/tables/mytable/records`
        );
        recordsRef.once('value').then(snapshot => {
          expect(snapshot.val()).to.deep.equal({
            1: '{"foo":true,"id":1}',
            2: '{"foo":"bar","id":2}'
          });
          expect(onErrorCalled).to.be.true;
          done();
        });
      }
    });

    it('warns on invalid numbers', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {foo: 1},
        () => {
          FirebaseStorage.createRecord(
            'mytable',
            {foo: '2xyz'},
            () => {
              doCoerce();
            },
            error => {
              throw error;
            }
          );
        },
        error => {
          throw error;
        }
      );

      function doCoerce() {
        FirebaseStorage.coerceColumn(
          'mytable',
          'foo',
          'number',
          validate,
          validateError
        );
      }

      let onErrorCalled = false;
      function validateError(msg) {
        expect(msg).to.equal(
          'Not all values in column "foo" could be converted to type "number".'
        );
        onErrorCalled = true;
      }

      function validate() {
        const recordsRef = getProjectDatabase().child(
          `storage/tables/mytable/records`
        );
        recordsRef.once('value').then(snapshot => {
          expect(snapshot.val()).to.deep.equal({
            1: '{"foo":1,"id":1}',
            2: '{"foo":"2xyz","id":2}'
          });
          expect(onErrorCalled).to.be.true;
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
    const EXISTING_COUNTER_DATA = {
      cities: {
        lastId: 2,
        rowCount: 2
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
          2: '{"city":"Chicago","state":"IL","id":2}'
        }
      }
    };
    const BAD_JSON = '{';

    function verifyTable(expectedTablesData) {
      return getProjectDatabase()
        .child(`storage/tables`)
        .once('value')
        .then(
          snapshot => {
            expect(snapshot.val()).to.deep.equal(expectedTablesData);
          },
          error => {
            throw error;
          }
        );
    }

    it('loads new table data when no previous data exists', done => {
      const overwrite = false;
      FirebaseStorage.populateTable(
        NEW_TABLE_DATA_JSON,
        overwrite,
        () => verifyTable(NEW_TABLE_DATA).then(done),
        error => {
          throw error;
        }
      );
    });

    it('does not overwrite existing data when overwrite is false', done => {
      const overwrite = false;
      getProjectDatabase()
        .child(`storage/tables`)
        .set(EXISTING_TABLE_DATA)
        .then(() =>
          getProjectDatabase()
            .child('counters/tables')
            .set(EXISTING_COUNTER_DATA)
        )
        .then(() => {
          FirebaseStorage.populateTable(
            NEW_TABLE_DATA_JSON,
            overwrite,
            () => verifyTable(EXISTING_TABLE_DATA).then(done),
            error => {
              throw error;
            }
          );
        });
    });

    // Some users got into a bad state where populateTables wrote storage/tables,
    // but failed to write counters/tables due to a security rule violation. Make
    // sure we overwrite tables for users in that state.
    it('does overwrite existing data when counters/tables node is empty', done => {
      const overwrite = false;
      getProjectDatabase()
        .child(`storage/tables`)
        .set(EXISTING_TABLE_DATA)
        .then(() => {
          FirebaseStorage.populateTable(
            NEW_TABLE_DATA_JSON,
            overwrite,
            () => verifyTable(NEW_TABLE_DATA).then(done),
            error => {
              throw error;
            }
          );
        });
    });

    it('does overwrite existing data when overwrite is true', done => {
      const overwrite = true;
      getProjectDatabase()
        .child(`storage/tables`)
        .set(EXISTING_TABLE_DATA)
        .then(() =>
          getProjectDatabase()
            .child('counters/tables')
            .set(EXISTING_COUNTER_DATA)
        )
        .then(() => {
          FirebaseStorage.populateTable(
            NEW_TABLE_DATA_JSON,
            overwrite,
            () => verifyTable(NEW_TABLE_DATA).then(done),
            error => {
              throw error;
            }
          );
        });
    });

    it('prints a friendly error message when given bad table json', done => {
      const overwrite = false;

      FirebaseStorage.populateTable(
        BAD_JSON,
        overwrite,
        () => {
          throw 'expected JSON error to be reported';
        },
        validateError
      );

      function validateError(error) {
        expect(error).to.contain('SyntaxError');
        expect(error).to.contain('while parsing initial table data: {');
        done();
      }
    });
  });

  describe('populateKeyValue', () => {
    const EXISTING_KEY_VALUE_DATA = {
      click_count: '1'
    };
    const NEW_KEY_VALUE_DATA_JSON = `{
        "click_count": 5
      }`;
    const NEW_KEY_VALUE_DATA = {
      click_count: '5'
    };
    const BAD_JSON = '{';

    function verifyKeyValue(expectedData) {
      return getProjectDatabase()
        .child(`storage/keys`)
        .once('value')
        .then(
          snapshot => {
            expect(snapshot.val()).to.deep.equal(expectedData);
          },
          error => {
            throw error;
          }
        );
    }

    it('loads new key value data when no previous data exists', done => {
      const overwrite = false;
      FirebaseStorage.populateKeyValue(
        NEW_KEY_VALUE_DATA_JSON,
        overwrite,
        () => verifyKeyValue(NEW_KEY_VALUE_DATA).then(done),
        error => {
          throw error;
        }
      );
    });

    it('does not overwrite existing data when overwrite is false', done => {
      const overwrite = false;
      getProjectDatabase()
        .child(`storage/keys`)
        .set(EXISTING_KEY_VALUE_DATA)
        .then(() => {
          FirebaseStorage.populateKeyValue(
            NEW_KEY_VALUE_DATA_JSON,
            overwrite,
            () => verifyKeyValue(EXISTING_KEY_VALUE_DATA).then(done),
            error => {
              throw error;
            }
          );
        });
    });

    it('does overwrite existing data when overwrite is true', done => {
      const overwrite = true;
      getProjectDatabase()
        .child(`storage/keys`)
        .set(EXISTING_KEY_VALUE_DATA)
        .then(() => {
          FirebaseStorage.populateKeyValue(
            NEW_KEY_VALUE_DATA_JSON,
            overwrite,
            () => verifyKeyValue(NEW_KEY_VALUE_DATA).then(done),
            error => {
              throw error;
            }
          );
        });
    });

    it('prints a friendly error message when given bad key value json', done => {
      const overwrite = false;

      FirebaseStorage.populateKeyValue(
        BAD_JSON,
        overwrite,
        () => {
          throw 'expected JSON error to be reported';
        },
        validateError
      );

      function validateError(error) {
        expect(error).to.contain('SyntaxError');
        expect(error).to.contain('while parsing initial key/value data: {');
        done();
      }
    });
  });

  describe('readRecords', () => {
    it('can read a table with rows', done => {
      const csvData =
        'id,name,age,male\n' +
        '4,alice,7,false\n' +
        '5,bob,8,true\n' +
        '6,charlie,9,true\n';
      const expectedRecords = [
        {id: 1, name: 'alice', age: 7, male: false},
        {id: 2, name: 'bob', age: 8, male: true},
        {id: 3, name: 'charlie', age: 9, male: true}
      ];

      FirebaseStorage.importCsv(
        'mytable',
        csvData,
        () => {
          FirebaseStorage.readRecords('mytable', {}, onSuccess, error => {
            throw error;
          });
        },
        error => {
          throw error;
        }
      );
      function onSuccess(records) {
        expect(records).to.deep.equal(expectedRecords);
        done();
      }
    });

    it('returns [] for a table with no rows', done => {
      FirebaseStorage.createTable(
        'emptytable',
        () => {
          FirebaseStorage.readRecords('emptytable', {}, onSuccess, error => {
            throw error;
          });
        },
        error => {
          throw error;
        }
      );
      function onSuccess(records) {
        expect(records).to.deep.equal([]);
        done();
      }
    });

    it('returns null for a non-existent table', done => {
      FirebaseStorage.readRecords('notATable', {}, onSuccess, error => {
        throw error;
      });
      function onSuccess(records) {
        expect(records).to.equal(null);
        done();
      }
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
        error => {
          throw error;
        }
      );

      function validateTableData() {
        const rowCountRef = getProjectDatabase().child(
          'counters/tables/mytable/rowCount'
        );
        rowCountRef
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.equal(3);
            const recordsRef = getProjectDatabase().child(
              'storage/tables/mytable/records'
            );
            return recordsRef.once('value');
          })
          .then(snapshot => {
            expect(snapshot.val()).to.deep.equal(expectedTableData);
            done();
          });
      }
    });

    it('overwrites existing data', done => {
      FirebaseStorage.createRecord(
        'mytable',
        {name: 'eve', age: 11, male: false},
        doImport,
        error => {
          throw error;
        }
      );

      function doImport() {
        FirebaseStorage.importCsv(
          'mytable',
          csvData,
          validateTableData,
          error => {
            throw error;
          }
        );
      }

      function validateTableData() {
        const rowCountRef = getProjectDatabase().child(
          'counters/tables/mytable/rowCount'
        );
        rowCountRef
          .once('value')
          .then(snapshot => {
            expect(snapshot.val()).to.equal(3);
            const recordsRef = getProjectDatabase().child(
              'storage/tables/mytable/records'
            );
            return recordsRef.once('value');
          })
          .then(snapshot => {
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
        () => {
          throw 'expected import to fail on large record';
        },
        error => {
          expect(error).to.contain('one of of the records is too large');
          done();
        }
      );
    });

    it('rejects too many rows', done => {
      const longCsvData = 'name\n' + 'bob\n'.repeat(25);
      FirebaseStorage.importCsv(
        'mytable',
        longCsvData,
        () => {
          throw 'expected import to fail on large table';
        },
        error => {
          expect(error).to.contain('the data is too large');
          done();
        }
      );
    });
  });
});
