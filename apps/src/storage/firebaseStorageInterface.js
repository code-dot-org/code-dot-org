// Entry point
function initFirebaseStorage(config) {}

/* DATA BLOCKS */

FirebaseStorage.getKeyValue = function (key, onSuccess, onError) {}
FirebaseStorage.setKeyValue = function (key, value, onSuccess, onError) {}
FirebaseStorage.createRecord = function (tableName, record, onSuccess, onError) {}
FirebaseStorage.readRecords = function (tableName, searchParams, onSuccess, onError) {}
FirebaseStorage.updateRecord = function (tableName, record, onSuccess, onError) {}
FirebaseStorage.deleteRecord = function (tableName, record, onSuccess, onError) {}


// DEPRECATED: we are planning to remove this block
FirebaseStorage.onRecordEvent = function (tableName) {}

/* DATA BROWSER */

FirebaseStorage.createTable = function (tableName, onSuccess, onError) {}
FirebaseStorage.deleteTable = function (tableName, type, onSuccess, onError) {}
// Delete all the rows, but leave the column definitions intact
FirebaseStorage.clearTable = function (tableName, onSuccess, onError) {}
FirebaseStorage.addColumn = function (tableName, columnName, onSuccess, onError) {}
// Delete the column definition AND filters all rows to remove the offending JSON property
FirebaseStorage.deleteColumn = function (tableName, columnName, onSuccess, onError) {}
FirebaseStorage.renameColumn = function (tableName, oldName, newName, onSuccess, onError) {}
FirebaseStorage.coerceColumn = function (tableName, columnName, columnType, onSuccess, onError) {}
FirebaseStorage.importCsv = function (tableName, tableDataCsv, onSuccess, onError) {}

/* NOT BLOCKS */

// Used to inject levelbuilder defined data tables into the current project (see applab.js)
FirebaseStorage.populateTable = function (jsonData) {}
FirebaseStorage.populateKeyValue = function (jsonData, onSuccess, onError) {}

FirebaseStorage.deleteKeyValue = function (key, onSuccess, onError) {}

// gets a list of all the shared or current tables available in the data browser
FirebaseStorage.getLibraryManifest = function () {}

// returns an array of strings for each of the columns in the table
FirebaseStorage.getColumnsForTable = function (tableName, tableType) {}

// @return {Promise<boolean>} whether the project channelID (configured at initFirebaseStorage) exists
FirebaseStorage.channelExists = function () {}

// deletes the entire channel in firebase
// used only one place, applab.js config.afterClearPuzzle()
FirebaseStorage.clearAllData = function (onSuccess, onError) {}

// Current tables are live updated, the data is NOT copied into
// the student project, instead a new type of firebase node is created
// like /v3/channels/NZfs8i-ivpdJe_CXtPfHtOCssNIRTY1oKd5uXfSiuyI/current_tables/Daily Weather
// as opposed to a normal table that would be like 
// /v3/channels/NZfs8i-ivpdJe_CXtPfHtOCssNIRTY1oKd5uXfSiuyI/storage/tables/Daily Weather
//
// Current tables can be found in https://console.firebase.google.com/project/cdo-v3-shared/database/cdo-v3-shared/data/~2Fv3~2Fchannels~2Fshared~2Fmetadata~2Fmanifest~2Ftables
// where the table has `current: true` set in the manifest object
FirebaseStorage.addCurrentTableToProject = function (tableName, onSuccess, onError) {}

// Makes a project-local copy of one of the tables stored at /v3/channels/shared/storage/tables
FirebaseStorage.copyStaticTable = function (tableName, onSuccess, onError) {}

/* TESTING RELATED FUNCTIONS */

// Deletes the entire database for the project, including data and config
FirebaseStorage.resetForTesting = function () {}

/* NOT EXPORTED INTERNAL USE FUNCTIONS THAT MIGHT BE OF INTEREST FOR REFACTORING */

/**
 * Returns true if record matches the given search parameters, which are a map
 * from key name to expected value.
 */
function matchesSearch(record, searchParams) {}
function validateTableName(tableName) {}
function validateRecord(record, hasId) {}
function getExistingTables() {}
function getRecordsData(records) {} // Converts records into a format that can be written to a table's `records` node in
function getExistingKeyValues() {}
function coerceRecord(record, columnName, columnType) {} // Modifies the record[columnName] to type columnType,
function parseRecordsDataFromCsv(csvData) {} // Parses a CSV string into records data in a format that can be written into the records node of a firebase table

// This one we probably want to duplicate the logic on the backend:
function validateRecordsData(recordsData) {} // Validates that the records data does not exceed size limits.

// Used by FirebaseStorage.populateTable and FirebaseStorage.importCsv
function overwriteTableData(tableName, recordsData) {}