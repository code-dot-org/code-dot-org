import tickWrapper from '../../util/tickWrapper';
import {TestResults} from '@cdo/apps/constants';
import ReactTestUtils from 'react-addons-test-utils';

const enterKeyEvent = {key: 'Enter', keyCode: 13, which: 13};

module.exports = {
  app: 'applab',
  skinId: 'applab',
  levelFile: 'levels',
  levelId: 'ec_simple',
  tests: [
    {
      description: 'Data button hidden when hideViewDataButton is specified',
      editCode: true,
      hideViewDataButton: true,

      runBeforeClick: function(assert) {
        assert.equal(
          $('#codeModeButton').is(':visible'),
          true,
          'code mode button is visible'
        );
        assert.equal(
          $('#designModeButton').is(':visible'),
          true,
          'design mode button is visible'
        );
        assert.equal(
          $('#dataModeButton').is(':visible'),
          false,
          'data mode button is hidden'
        );

        Applab.onPuzzleComplete();
      },
      customValidator: function(assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'version history button works in data mode',
      editCode: true,

      runBeforeClick: function(assert) {
        $('#dataModeButton').click();
        assert.equal(
          $('#dataOverview').is(':visible'),
          true,
          'dataOverview is visible'
        );
        assert.equal(
          $('#data-mode-versions-header').is(':visible'),
          true,
          'version history button is visible'
        );

        $('#data-mode-versions-header').click();
        assert.equal(
          $('.dialog-title:visible').text(),
          'Version History',
          'version history dialog is visible'
        );

        Applab.onPuzzleComplete();
      },
      customValidator: function(assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'Data Browser shows records and key value pairs',
      editCode: true,
      xml: `
        createRecord('mytable', {name:'Alice', age:7}, function () {
          console.log('created record');
          setKeyValue('key1', 'value1', function() {
            console.log('created key');
          });
        });`,

      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 200, function() {
          // Overview
          $('#dataModeButton').click();
          const dataOverview = $('#dataOverview');
          assert.equal(
            dataOverview.is(':visible'),
            true,
            'dataOverview is visible'
          );
          const keyValueLink = dataOverview.find('a:contains(Key/value pairs)');
          const tableLink = dataOverview.find('a:contains(mytable)');
          assert.equal(
            keyValueLink.is(':visible'),
            true,
            'key/value pairs link is visible'
          );
          assert.equal(tableLink.is(':visible'), true, 'table link is visible');

          // Key/value pairs
          ReactTestUtils.Simulate.click(keyValueLink[0]);
          const dataProperties = $('#dataProperties');
          assert.equal(
            dataProperties.is(':visible'),
            true,
            'dataProperties is visible'
          );
          const keyValueRow = dataProperties.find('tr:contains(key1)');
          assert.equal(
            keyValueRow.is(':visible'),
            true,
            'new key appears in the grid'
          );

          // back to Overview
          ReactTestUtils.Simulate.click($('#propertiesBackToOverview')[0]);
          assert.equal(
            dataOverview.is(':visible'),
            true,
            'dataOverview is visible again'
          );
          assert.equal(
            keyValueLink.is(':visible'),
            true,
            'key/value pairs link is visible again'
          );
          assert.equal(
            tableLink.is(':visible'),
            true,
            'table link is visible again'
          );
          ReactTestUtils.Simulate.click(tableLink[0]);

          // Table
          const dataTable = $('#dataTable');
          assert.equal(dataTable.is(':visible'), true, 'dataTable is visible');
          const recordRow = dataTable.find('tr:contains(Alice)');
          assert.equal(
            recordRow.is(':visible'),
            true,
            'new record appears in the grid'
          );

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"created record"' + '"created key"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'Data Browser can add tables, columns and rows',
      editCode: true,

      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          // Overview
          $('#dataModeButton').click();
          const dataOverview = $('#dataOverview');
          assert.equal(
            dataOverview.is(':visible'),
            true,
            'dataOverview is visible'
          );
          let tableLink = dataOverview.find('a:contains(mytable)');
          assert.equal(tableLink.length, 0, 'mytable link does not exist yet');

          // Create a new table from the overview
          const newTableInput = dataOverview.find('input');
          ReactTestUtils.Simulate.change(newTableInput[0], {
            target: {value: 'mytable'}
          });
          const addTableButton = dataOverview.find('button:contains(Add)');
          ReactTestUtils.Simulate.click(addTableButton[0]);
          setTimeout(() => {
            const dataTable = $('#dataTable');
            assert.equal(
              dataTable.is(':visible'),
              true,
              'dataTable is visible'
            );

            // rename initial column
            const column1NameInput = dataTable.find(
              'th > input[value="column1"]'
            );
            assert.equal(
              column1NameInput.is(':visible'),
              true,
              'column1 name input is visible'
            );
            ReactTestUtils.Simulate.change(column1NameInput[0], {
              target: {value: 'firstname'}
            });
            ReactTestUtils.Simulate.keyUp(column1NameInput[0], enterKeyEvent);
            setTimeout(() => {
              assert.equal(
                column1NameInput.is(':visible'),
                false,
                'column1 name input is hidden'
              );
              assert.equal(
                dataTable.find('th > div:contains(firstname)').is(':visible'),
                true,
                'column1 renamed to firstname'
              );

              // add new column
              ReactTestUtils.Simulate.click($('#addColumnButton')[0]);
              setTimeout(() => {
                let tableNames = dataTable
                  .find('th .test-tableNameDiv')
                  .get()
                  .map(div => div.innerHTML);
                assert.equal(
                  tableNames.join(','),
                  'id,firstname,column2',
                  'column order correct before column2 renamed'
                );
                const column2NameInput = dataTable.find(
                  'th > input[value="column2"]'
                );
                assert.equal(
                  column2NameInput.is(':visible'),
                  true,
                  'column2 name input is visible'
                );
                ReactTestUtils.Simulate.change(column2NameInput[0], {
                  target: {value: 'age'}
                });
                ReactTestUtils.Simulate.keyUp(
                  column2NameInput[0],
                  enterKeyEvent
                );
                setTimeout(() => {
                  assert.equal(
                    dataTable.find('th > div:contains(age)').is(':visible'),
                    true,
                    'column1 renamed to age'
                  );
                  tableNames = dataTable
                    .find('th .test-tableNameDiv')
                    .get()
                    .map(div => div.innerHTML);
                  assert.equal(
                    tableNames.join(','),
                    'id,firstname,age',
                    'column order correct after column2 renamed'
                  );

                  // add new row
                  const addRow = $('#dataTable').find('tr:contains(Add Row)');
                  ReactTestUtils.Simulate.change(addRow.find('input')[0], {
                    target: {value: 'bob'}
                  });
                  ReactTestUtils.Simulate.change(addRow.find('input')[1], {
                    target: {value: '8'}
                  });
                  ReactTestUtils.Simulate.keyUp(
                    addRow.find('input')[1],
                    enterKeyEvent
                  );
                  setTimeout(() => {
                    const dataRow1 = $('#dataTable').find('tr:contains(Edit)');
                    assert.equal(
                      dataRow1.find('td')[0].innerHTML,
                      '1',
                      'id cell value'
                    );
                    assert.equal(
                      dataRow1.find('td')[1].innerHTML,
                      '"bob"',
                      'firstname cell value'
                    );
                    assert.equal(
                      dataRow1.find('td')[2].innerHTML,
                      '8',
                      'age cell value'
                    );

                    // add another row
                    ReactTestUtils.Simulate.change(addRow.find('input')[0], {
                      target: {value: 'charlie'}
                    });
                    ReactTestUtils.Simulate.change(addRow.find('input')[1], {
                      target: {value: '9'}
                    });
                    ReactTestUtils.Simulate.keyUp(
                      addRow.find('input')[1],
                      enterKeyEvent
                    );
                    setTimeout(() => {
                      const dataRow2 = $('#dataTable').find(
                        'tr:contains(Edit)'
                      );
                      assert.equal(
                        dataRow2.find('td')[0].innerHTML,
                        '1',
                        'id cell value'
                      );
                      assert.equal(
                        dataRow2.find('td')[1].innerHTML,
                        '"bob"',
                        'firstname cell value'
                      );
                      assert.equal(
                        dataRow2.find('td')[2].innerHTML,
                        '8',
                        'age cell value'
                      );

                      Applab.onPuzzleComplete();
                    }, 100);
                  }, 100);
                }, 100);
              }, 100);
            }, 100);
          }, 100);
        });
      },
      customValidator: function(assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'Data Browser can edit table rows',
      editCode: true,
      xml: `
        createRecord('mytable', {name:'Alice', age:7, male:false}, function () {
          console.log('created record 1');
          createRecord('mytable', {name:'Bob', age:8, male:true}, function () {
            console.log('created record 2');
          });
        });`,

      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 200, function() {
          // Overview
          $('#dataModeButton').click();
          const dataOverview = $('#dataOverview');
          assert.equal(
            dataOverview.is(':visible'),
            true,
            'dataOverview is visible'
          );
          const tableLink = dataOverview.find('a:contains(mytable)');
          assert.equal(tableLink.is(':visible'), true, 'table link is visible');

          // view table
          ReactTestUtils.Simulate.click(tableLink[0]);
          const dataTable = $('#dataTable');
          assert.equal(dataTable.is(':visible'), true, 'dataTable is visible');
          const record1Row = dataTable.find('tr:contains(Alice)');
          assert.equal(
            record1Row.is(':visible'),
            true,
            'record 1 appears in the grid'
          );
          const record2Row = dataTable.find('tr:contains(Bob)');
          assert.equal(
            record2Row.is(':visible'),
            true,
            'record 2 appears in the grid'
          );

          // edit row
          let editButton = record1Row.find('button:contains(Edit)');
          assert.equal(
            editButton.is(':visible'),
            true,
            'edit row button visible'
          );
          ReactTestUtils.Simulate.click(editButton[0]);
          const saveButton = record1Row.find('button:contains(Save)');
          editButton = record1Row.find('button:contains(Edit)');
          assert.equal(
            editButton.is(':visible'),
            false,
            'edit row button hidden'
          );
          assert.equal(
            saveButton.is(':visible'),
            true,
            'save row button visible'
          );
          const ageInput = record1Row.find('input')[1];
          assert.equal(ageInput.value, '7', 'age input cell value in edit row');
          ReactTestUtils.Simulate.change(ageInput, {target: {value: '9'}});
          ReactTestUtils.Simulate.keyUp(ageInput, enterKeyEvent);
          setTimeout(() => {
            editButton = record1Row.find('button:contains(Edit)');
            assert.equal(
              editButton.is(':visible'),
              true,
              'edit row button visible'
            );
            const ageCell = record1Row.find('td')[2];
            assert.equal(ageCell.innerHTML, '9', 'age cell saved value');

            Applab.onPuzzleComplete();
          }, 100);
        });
      },
      customValidator: function(assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"created record 1"' + '"created record 2"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'Data Browser can rename or delete table columns',
      editCode: true,
      xml: `
        createRecord('mytable', {oldName:'Alice', age:7, male:false}, function () {
          console.log('created record');
        });
        onRecordEvent("mytable", function(record, eventType) {
          if (eventType === 'update') {
            console.log('record updated: ' + JSON.stringify(record));
          }
        });`,

      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 200, function() {
          // Overview
          $('#dataModeButton').click();
          const dataOverview = $('#dataOverview');
          assert.equal(
            dataOverview.is(':visible'),
            true,
            'dataOverview is visible'
          );
          const tableLink = dataOverview.find('a:contains(mytable)');
          assert.equal(tableLink.is(':visible'), true, 'table link is visible');

          // view table
          ReactTestUtils.Simulate.click(tableLink[0]);
          const dataTable = $('#dataTable');
          assert.equal(dataTable.is(':visible'), true, 'dataTable is visible');
          const record1Row = dataTable.find('tr:contains(Alice)');
          assert.equal(
            record1Row.is(':visible'),
            true,
            'record 1 appears in the grid'
          );

          // rename column
          const nameHeader = dataTable.find('th:contains(oldName)');
          assert.equal(
            nameHeader.is(':visible'),
            true,
            'Name header is visible'
          );
          const gearIcon = nameHeader.find('.fa-cog');
          ReactTestUtils.Simulate.click(gearIcon[0]);
          const renameLink = nameHeader.find('a:contains(Rename)');
          assert.equal(
            renameLink.is(':visible'),
            true,
            'Rename link is visible'
          );
          ReactTestUtils.Simulate.click(renameLink[0]);
          const columnInput = nameHeader.find('input');
          assert.equal(
            columnInput.is(':visible'),
            true,
            'column input is visible'
          );
          ReactTestUtils.Simulate.change(columnInput[0], {
            target: {value: 'newName'}
          });
          ReactTestUtils.Simulate.keyUp(columnInput[0], enterKeyEvent);
          setTimeout(() => {
            const newTitle = dataTable.find('th > div:contains(newName)');
            assert.equal(
              newTitle.is(':visible'),
              true,
              'name header is visible'
            );

            // delete column
            let genderHeader = dataTable.find('th:contains(male)');
            assert.equal(
              genderHeader.is(':visible'),
              true,
              'Gender header is visible'
            );
            const gearIcon = genderHeader.find('.fa-cog');
            ReactTestUtils.Simulate.click(gearIcon[0]);
            const deleteLink = genderHeader.find('a:contains(Delete)');
            assert.equal(
              deleteLink.is(':visible'),
              true,
              'Delete link is visible'
            );
            ReactTestUtils.Simulate.click(deleteLink[0]);

            // confirm delete
            const confirmDeleteButton = genderHeader.find(
              'button:contains(Delete)'
            );
            assert.equal(
              confirmDeleteButton.is(':visible'),
              true,
              'Confirm delete button is visible'
            );
            ReactTestUtils.Simulate.click(confirmDeleteButton[0]);
            setTimeout(() => {
              genderHeader = dataTable.find('th:contains(male)');
              assert.equal(genderHeader.length, 0, 'gender header is gone');

              Applab.onPuzzleComplete();
            }, 100);
          }, 100);
        });
      },
      customValidator: function(assert) {
        // Verify that onRecordEvent was called with the correct data
        var debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"created record"' +
            '"record updated: {"newName":"Alice","age":7,"male":false,"id":1}"' +
            '"record updated: {"newName":"Alice","age":7,"id":1}"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'Data Browser can delete records and clear tables',
      editCode: true,
      xml: `
        createRecord('mytable', {oldName:'Alice', age:7, male:false}, function (record) {
          console.log('created record ' + record.id);
          createRecord('mytable', {oldName:'Bob', age:8, male:true}, function (record) {
            console.log('created record ' + record.id);
          });
        });
        onRecordEvent('mytable', function(record, eventType) {
          if (eventType === 'delete') {
            console.log('deleted record ' + record.id);
          }
        });`,

      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 200, function() {
          // Overview
          $('#dataModeButton').click();
          const dataOverview = $('#dataOverview');
          assert.equal(
            dataOverview.is(':visible'),
            true,
            'dataOverview is visible'
          );
          const tableLink = dataOverview.find('a:contains(mytable)');
          assert.equal(tableLink.is(':visible'), true, 'table link is visible');

          // view table
          ReactTestUtils.Simulate.click(tableLink[0]);
          const dataTable = $('#dataTable');
          assert.equal(dataTable.is(':visible'), true, 'dataTable is visible');
          let record1Row = dataTable.find('tr:contains(Alice)');
          assert.equal(
            record1Row.is(':visible'),
            true,
            'record 1 appears in the grid'
          );
          let record2Row = dataTable.find('tr:contains(Bob)');
          assert.equal(
            record2Row.is(':visible'),
            true,
            'record 2 appears in the grid'
          );

          // delete record
          let deleteRowButton = record1Row.find('button:contains(Delete)');
          assert.equal(
            deleteRowButton.is(':visible'),
            true,
            'delete row button visible'
          );
          ReactTestUtils.Simulate.click(deleteRowButton[0]);
          setTimeout(() => {
            record1Row = dataTable.find('tr:contains(Alice)');
            assert.equal(record1Row.length, 0, 'record 1 no longer exists');

            // clear table
            const clearTableButton = $('#clearTableButton');
            assert.equal(
              clearTableButton.is(':visible'),
              true,
              'Clear table button is visible'
            );
            ReactTestUtils.Simulate.click(clearTableButton[0]);

            // confirm delete
            const confirmDeleteButton = clearTableButton
              .parent()
              .find('button:contains(Delete)');
            assert.equal(
              confirmDeleteButton.is(':visible'),
              true,
              'Confirm delete button is visible'
            );
            ReactTestUtils.Simulate.click(confirmDeleteButton[0]);
            setTimeout(() => {
              assert.equal(
                $('#dataTable').is(':visible'),
                true,
                'dataTable is still visible'
              );
              record2Row = dataTable.find('tr:contains(Bob)');
              assert.equal(record2Row.length, 0, 'record 2 no longer exists');

              Applab.onPuzzleComplete();
            }, 100);
          }, 100);
        });
      },
      customValidator: function(assert) {
        // Verify that onRecordEvent was called with the correct data
        var debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"created record 1"' +
            '"created record 2"' +
            '"deleted record 1"' +
            '"deleted record 2"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    // The data browser uses Firebase.off() somewhat broadly in order to stop
    // listening for data changes as you switch between data browser views. This
    // could potentially interfere with the listeners used by the onRecordEvent
    // block. This test ensures that the onRecordEvent block works properly even
    // as the data browser switches views.
    {
      description: "Data Browser doesn't interfere with onRecordEvent",
      editCode: true,
      xml: `
        button("createRecord", "Create");
        onEvent("createRecord", "click", function(event) {
          createRecord("mytable", {name: 'Alice'});
        });
        onRecordEvent('mytable', function(record, eventType) {
          if (eventType === 'create') {
            console.log('created record ' + record.id);
          } 
        });`,

      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          const debugOutput = document.getElementById('debug-output');

          // Data mode overview
          $('#dataModeButton').click();
          const dataOverview = $('#dataOverview');
          assert.equal(
            dataOverview.is(':visible'),
            true,
            'dataOverview is initially visible'
          );
          let tableLink = dataOverview.find('a:contains(mytable)');
          assert.equal(
            tableLink.length,
            0,
            'mytable link does not initially exist'
          );
          assert.equal(debugOutput.textContent, '');

          // create record 1
          $('#createRecord').click();
          setTimeout(() => {
            tableLink = dataOverview.find('a:contains(mytable)');
            assert.equal(tableLink.is(':visible'), true, 'table link exists');
            assert.equal(debugOutput.textContent, '"created record 1"'); //
            ReactTestUtils.Simulate.click(tableLink[0]);

            // view mytable
            const dataTable = $('#dataTable');
            assert.equal(
              dataTable.is(':visible'),
              true,
              'dataTable is visible'
            );
            let recordRow = dataTable.find('tr:contains(Alice)');
            assert.equal(
              recordRow.length,
              1,
              'one table row exists in mytable'
            );

            // back to overview
            ReactTestUtils.Simulate.click($('#tableBackToOverview')[0]);
            const newTableInput = dataOverview.find('input');
            ReactTestUtils.Simulate.change(newTableInput[0], {
              target: {value: 'other table'}
            });
            const addTableButton = dataOverview.find('button:contains(Add)');

            // view other table
            ReactTestUtils.Simulate.click(addTableButton[0]);
            setTimeout(() => {
              assert.equal(
                dataTable.is(':visible'),
                true,
                'other table is visible'
              );
              recordRow = dataTable.find('tr:contains(Alice)');
              assert.equal(recordRow.length, 0, 'no table rows in other table');

              // create record 2
              $('#createRecord').click();
              setTimeout(() => {
                recordRow = dataTable.find('tr:contains(Alice)');
                assert.equal(
                  recordRow.length,
                  0,
                  'still no table rows in other table'
                );
                assert.equal(
                  debugOutput.textContent,
                  '"created record 1"' + '"created record 2"'
                );

                // back to overview
                ReactTestUtils.Simulate.click($('#tableBackToOverview')[0]);

                // view mytable
                ReactTestUtils.Simulate.click(tableLink[0]);
                recordRow = dataTable.find('tr:contains(Alice)');
                assert.equal(recordRow.length, 2, 'two table rows in mytable');
                assert.equal(
                  debugOutput.textContent,
                  '"created record 1"' + '"created record 2"'
                );

                // create record 3
                $('#createRecord').click();
                setTimeout(() => {
                  recordRow = dataTable.find('tr:contains(Alice)');
                  assert.equal(
                    recordRow.length,
                    3,
                    'three table rows in mytable'
                  );
                  assert.equal(
                    debugOutput.textContent,
                    '"created record 1"' +
                      '"created record 2"' +
                      '"created record 3"'
                  );

                  Applab.onPuzzleComplete();
                }, 100);
              }, 100);
            }, 100);
          }, 100);
        });
      },
      customValidator: function(assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"created record 1"' + '"created record 2"' + '"created record 3"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'Data Browser can add/edit/delete key value pairs',
      editCode: true,

      runBeforeClick: function(assert) {
        tickWrapper.runOnAppTick(Applab, 2, function() {
          // Overview
          $('#dataModeButton').click();
          const dataOverview = $('#dataOverview');
          assert.equal(
            dataOverview.is(':visible'),
            true,
            'dataOverview is visible'
          );
          const keyValueLink = dataOverview.find('a:contains(Key/value pairs)');
          assert.equal(
            keyValueLink.is(':visible'),
            true,
            'key/value pairs link is visible'
          );

          // Properties view
          ReactTestUtils.Simulate.click(keyValueLink[0]);
          const dataProperties = $('#dataProperties');
          assert.equal(
            dataProperties.is(':visible'),
            true,
            'dataProperties is visible'
          );

          // add key/value pair via enter key
          const addRow = dataProperties.find('tr:contains(Add pair)');
          ReactTestUtils.Simulate.change(addRow.find('input')[0], {
            target: {value: 'key1'}
          });
          ReactTestUtils.Simulate.change(addRow.find('input')[1], {
            target: {value: 'value1'}
          });
          ReactTestUtils.Simulate.keyUp(addRow.find('input')[1], enterKeyEvent);
          setTimeout(() => {
            let keyValueRow1 = dataProperties.find('tr:contains(key1)');
            assert.equal(
              keyValueRow1.is(':visible'),
              true,
              'key1 appears in the grid'
            );
            assert.equal(
              keyValueRow1.is(':visible'),
              true,
              'key2 appears in the grid'
            );
            assert.equal(
              keyValueRow1.find('td:contains("value1")').length,
              1,
              'value1 appears in key1 row'
            );

            // add key/value pair via button click
            ReactTestUtils.Simulate.change(addRow.find('input')[0], {
              target: {value: 'key2'}
            });
            ReactTestUtils.Simulate.change(addRow.find('input')[1], {
              target: {value: '123'}
            });
            const addPairButton = dataProperties.find(
              'button:contains(Add pair)'
            );
            assert.equal(
              addPairButton.is(':visible'),
              true,
              'Add pair button is visible'
            );
            ReactTestUtils.Simulate.click(addPairButton[0]);
            setTimeout(() => {
              let keyValueRow2 = dataProperties.find('tr:contains(key2)');
              assert.equal(
                keyValueRow2.is(':visible'),
                true,
                'key2 appears in the grid'
              );
              assert.equal(
                keyValueRow2.find('td:contains(123)').length,
                1,
                '123 appears in key2 row'
              );

              // edit row1
              let editButton = keyValueRow1.find('button:contains(Edit)');
              assert.equal(
                editButton.is(':visible'),
                true,
                'edit row button visible'
              );
              ReactTestUtils.Simulate.click(editButton[0]);
              const saveButton = keyValueRow1.find('button:contains(Save)');
              editButton = keyValueRow1.find('button:contains(Edit)');
              assert.equal(
                editButton.is(':visible'),
                false,
                'edit row button hidden'
              );
              assert.equal(
                saveButton.is(':visible'),
                true,
                'save row button visible'
              );

              // save new row1 value
              const valueInput = keyValueRow1.find('input')[0];
              assert.equal(
                valueInput.value,
                'value1',
                'row1 input initial value'
              );
              ReactTestUtils.Simulate.change(valueInput, {
                target: {value: 'value2'}
              });
              ReactTestUtils.Simulate.keyUp(valueInput, enterKeyEvent);
              setTimeout(() => {
                editButton = keyValueRow1.find('button:contains(Edit)');
                assert.equal(
                  editButton.is(':visible'),
                  true,
                  'edit row button visible'
                );
                const ageCell = keyValueRow1.find('td')[1];
                assert.equal(
                  ageCell.innerHTML,
                  '"value2"',
                  'row1 value updated'
                );

                // delete key2
                let deleteRowButton = keyValueRow2.find(
                  'button:contains(Delete)'
                );
                assert.equal(
                  deleteRowButton.is(':visible'),
                  true,
                  'delete row button visible'
                );
                ReactTestUtils.Simulate.click(deleteRowButton[0]);
                setTimeout(() => {
                  keyValueRow1 = dataProperties.find('tr:contains(key1)');
                  assert.equal(keyValueRow1.length, 1, 'key1 row still exists');
                  keyValueRow2 = dataProperties.find('tr:contains(key2)');
                  assert.equal(
                    keyValueRow2.length,
                    0,
                    'key2 row no longer exists'
                  );

                  Applab.onPuzzleComplete();
                }, 100);
              }, 100);
            }, 100);
          }, 100);
        });
      },
      customValidator: function(assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
