import {makeEnum} from '../utils';

export const DataView = makeEnum('OVERVIEW', 'PROPERTIES', 'TABLE');

export const WarningType = makeEnum(
  'CANNOT_CONVERT_COLUMN_TYPE',
  'DUPLICATE_TABLE_NAME',
  'IMPORT_FAILED',
  'KEY_INVALID',
  'KEY_RENAMED',
  'MAX_TABLES_EXCEEDED',
  'TABLE_NAME_INVALID',
  'TABLE_RENAMED'
);
