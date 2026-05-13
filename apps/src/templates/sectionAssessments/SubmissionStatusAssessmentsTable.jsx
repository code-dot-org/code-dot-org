import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import {Typography} from '@mui/material';
import orderBy from 'lodash/orderBy';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';

import i18n from '@cdo/locale';

import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import wrappedSortable from '../tables/wrapped_sortable';

import {studentOverviewDataPropType} from './assessmentDataShapes';

import moduleStyles from './submission-status-table.module.scss';

const TABLE_WIDTH = tableLayoutStyles.table.width;
const TABLE_COLUMN_WIDTHS = {
  name: TABLE_WIDTH / 3,
  numMultipleChoiceCorrect: TABLE_WIDTH / 12,
  numMultipleChoice: TABLE_WIDTH / 12,
  numMatchCorrect: TABLE_WIDTH / 12,
  numMatch: TABLE_WIDTH / 12,
  submissionTimeStamp: TABLE_WIDTH / 3,
};

export const COLUMNS = {
  NAME: 0,
  NUM_MULTIPLE_CHOICE_CORRECT: 1,
  NUM_MULTIPLE_CHOICE: 2,
  NUM_MATCH_CORRECT: 3,
  NUM_MATCH: 4,
  SUBMISSION_TIMESTAMP: 5,
};

/**
 * A table that shows the summary data for each student in a section.
 * Each row is a single student, the number of questions the student
 * answered correctly, the total number of multiple choice questions,
 * the percent of correct answers, and status of each student's
 * assessment or a time-stamp for when a student submits an
 * assessment.
 */
class SubmissionStatusAssessmentsTable extends Component {
  static propTypes = {
    studentOverviewData: PropTypes.arrayOf(studentOverviewDataPropType),
    localeCode: PropTypes.string,
  };

  state = {
    sortingColumns: {
      [COLUMNS.NAME]: {
        direction: 'asc',
        position: 0,
      },
    },
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  onSort = selectedColumn => {
    this.setState({
      sortingColumns: sort.byColumn({
        sortingColumns: this.state.sortingColumns,
        // Custom sortingOrder removes 'no-sort' from the cycle
        sortingOrder: {
          FIRST: 'asc',
          asc: 'desc',
          desc: 'asc',
        },
        selectedColumn,
      }),
    });
  };

  nameCellFormatter = (name, {rowData}) => {
    if (rowData.url) {
      return (
        <Link size="s" href={rowData.url}>
          {name}
        </Link>
      );
    } else {
      return (
        <Typography variant="body3">
          <Typography variant="strong" component="strong">
            {name}
          </Typography>
        </Typography>
      );
    }
  };

  submissionTimestampColumnFormatter = (submissionTimeStamp, {rowData}) => {
    const isSubmitted = rowData.isSubmitted;
    const inProgress = rowData.inProgress;
    let submissionTimeStampContent;
    switch (true) {
      case isSubmitted:
        // Localize timestamp if locale is defined, and use a (Date)Time
        // Element to preserve specificity.
        //
        // If locale is not defined, pass an empty array to use the browser's
        // default locale.
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString#parameters
        // and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters
        submissionTimeStampContent = (
          <time dateTime={rowData.submissionTimeStamp.toISOString()}>
            {rowData.submissionTimeStamp.toLocaleString(
              this.props.localeCode || []
            )}
          </time>
        );
        break;
      case inProgress:
        submissionTimeStampContent = i18n.inProgress();
        break;
      default:
        submissionTimeStampContent = i18n.notStarted();
    }

    return (
      // `timestampCell` is kept as a global class hook for the test suite,
      // which selects by `.timestampCell` to verify sort order.
      <div className={`timestampCell ${moduleStyles.timestampCell}`}>
        <Typography variant="body3" className={moduleStyles.timestampText}>
          {submissionTimeStampContent}
        </Typography>
        {isSubmitted && (
          <FontAwesomeV6Icon
            id="checkmark"
            iconName="check-circle"
            className={moduleStyles.submittedIcon}
          />
        )}
      </div>
    );
  };

  getColumns = sortable => {
    let dataColumns = [
      {
        property: 'name',
        header: {
          label: i18n.studentNameHeader(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.name},
            },
          },
          transforms: [sortable],
        },
        cell: {
          formatters: [this.nameCellFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
            },
          },
        },
      },
      {
        property: 'numMultipleChoiceCorrect',
        header: {
          label: i18n.numMultipleChoiceCorrect(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.numMultipleChoiceCorrect},
            },
          },
        },
        cell: {
          props: {style: tableLayoutStyles.cell},
        },
      },
      {
        property: 'numMultipleChoice',
        header: {
          label: i18n.numMultipleChoice(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.numMultipleChoice},
            },
          },
        },
        cell: {
          props: {style: tableLayoutStyles.cell},
        },
      },
      {
        property: 'numMatchCorrect',
        header: {
          label: i18n.numMatchCorrect(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.numMatchCorrect},
            },
          },
        },
        cell: {
          props: {style: tableLayoutStyles.cell},
        },
      },
      {
        property: 'numMatch',
        header: {
          label: i18n.numMatch(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.numMatch},
            },
          },
        },
        cell: {
          props: {style: tableLayoutStyles.cell},
        },
      },
      {
        property: 'submissionTimeStamp',
        header: {
          label: i18n.submissionTimestamp(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.timeStamp},
            },
            id: 'timestampHeaderCell',
          },
          transforms: [sortable],
        },
        cell: {
          formatters: [this.submissionTimestampColumnFormatter],
          props: {style: tableLayoutStyles.cell},
        },
      },
    ];
    return dataColumns;
  };

  render() {
    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(
      this.getSortingColumns,
      this.onSort,
      sortableOptions
    );
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy,
    })(this.props.studentOverviewData);

    return (
      <Table.Provider
        columns={columns}
        style={tableLayoutStyles.table}
        id="uitest-submission-status-table"
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="id" />
      </Table.Provider>
    );
  }
}

export default SubmissionStatusAssessmentsTable;
