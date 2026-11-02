import {Typography} from '@mui/material';
import React from 'react';

import type {TableView} from '../types';

import tableStyles from './dataTable.module.scss';

interface TableEmptyNoteProps {
  view: TableView;
  emptyText: string;
}

const TableEmptyNote = ({view, emptyText}: TableEmptyNoteProps) =>
  view.rows.length === 0 ? (
    <Typography variant="body4" component="p" className={tableStyles.emptyNote}>
      {view.totalRowCount === 0 ? emptyText : 'No rows match this filter.'}
    </Typography>
  ) : null;

export default TableEmptyNote;
