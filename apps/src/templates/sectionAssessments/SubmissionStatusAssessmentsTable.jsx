import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import {studentOverviewDataPropType} from './assessmentDataShapes';

const TABLE_WIDTH = tableLayoutStyles.table.width;
const TABLE_COLUMN_WIDTHS = {
  name: TABLE_WIDTH / 3,
  numMultipleChoiceCorrect: TABLE_WIDTH / 12,
  numMultipleChoice: TABLE_WIDTH / 12,
  numMatchCorrect: TABLE_WIDTH / 12,
  numMatch: TABLE_WIDTH / 12,
  submissionTimeStamp: TABLE_WIDTH / 3
};

const styles = {
  main: {
    border: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    color: color.purple,
    fontSize: 16
  },
  text: {
    marginRight: 5
  },
  headerLabels: {
    color: color.charcoal,
    fontFamily: '"Gotham 5r", sans-serif'
  },
  studentNameColumn: {
    color: color.teal,
    fontFamily: '"Gotham 5r", sans-serif'
  }
};

export const COLUMNS = {
  NAME: 0,
  NUM_MULTIPLE_CHOICE_CORRECT: 1,
  NUM_MULTIPLE_CHOICE: 2,
  NUM_MATCH_CORRECT: 3,
  NUM_MATCH: 4,
  SUBMISSION_TIMESTAMP: 5
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
    studentOverviewData: PropTypes.arrayOf(studentOverviewDataPropType)
  };

  state = {
    sortingColumns: {
      [COLUMNS.NAME]: {
        direction: 'asc',
        position: 0
      }
    }
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
          desc: 'asc'
        },
        selectedColumn
      })
    });
  };

  nameCellFormatter = (name, {rowData}) => {
    if (rowData.url) {
      return (
        <a href={rowData.url} style={styles.studentNameColumn}>
          {name}
        </a>
      );
    } else {
      return name;
    }
  };

  submissionTimestampColumnFormatter = (submissionTimeStamp, {rowData}) => {
    const isSubmitted = rowData.isSubmitted;
    const inProgress = rowData.inProgress;
    var submissionTimeStampText;
    switch (true) {
      case isSubmitted:
        submissionTimeStampText = rowData.submissionTimeStamp.toLocaleString();
        break;
      case inProgress:
        submissionTimeStampText = i18n.inProgress();
        break;
      default:
        submissionTimeStampText = i18n.notStarted();
    }

    return (
      <div style={styles.main} id="timestampCell">
        <div style={styles.text}>{submissionTimeStampText}</div>
        {isSubmitted && (
          <div style={styles.icon}>
            <FontAwesome id="checkmark" icon="check-circle" />
          </div>
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
              ...{width: TABLE_COLUMN_WIDTHS.name}
            }
          },
          transforms: [sortable]
        },
        cell: {
          formatters: [this.nameCellFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.studentNameColumn
            }
          }
        }
      },
      {
        property: 'numMultipleChoiceCorrect',
        header: {
          label: i18n.numMultipleChoiceCorrect(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.numMultipleChoiceCorrect}
            }
          }
        },
        cell: {
          props: {style: tableLayoutStyles.cell}
        }
      },
      {
        property: 'numMultipleChoice',
        header: {
          label: i18n.numMultipleChoice(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.numMultipleChoice}
            }
          }
        },
        cell: {
          props: {style: tableLayoutStyles.cell}
        }
      },
      {
        property: 'numMatchCorrect',
        header: {
          label: i18n.numMatchCorrect(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.numMatchCorrect}
            }
          }
        },
        cell: {
          props: {style: tableLayoutStyles.cell}
        }
      },
      {
        property: 'numMatch',
        header: {
          label: i18n.numMatch(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.numMatch}
            }
          }
        },
        cell: {
          props: {style: tableLayoutStyles.cell}
        }
      },
      {
        property: 'submissionTimeStamp',
        header: {
          label: i18n.submissionTimestamp(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.timeStamp}
            },
            id: 'timestampHeaderCell'
          },
          transforms: [sortable]
        },
        cell: {
          formatters: [this.submissionTimestampColumnFormatter],
          props: {style: tableLayoutStyles.cell}
        }
      }
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
      sort: orderBy
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
