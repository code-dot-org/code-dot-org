import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from "@cdo/apps/util/color";

const TABLE_WIDTH = tableLayoutStyles.table.width;
const TABLE_COLUMN_WIDTHS = {
  name: TABLE_WIDTH / 3,
  numMultipleChoiceCorrect: TABLE_WIDTH / 8,
  numMultipleChoice: TABLE_WIDTH / 8,
  percentCorrect: TABLE_WIDTH / 8,
  submissionTimeStamp: TABLE_WIDTH / 5
};

const styles = {
  main: {
    border: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    color: color.purple,
    fontSize: 16,
  },
  text: {
    marginRight: 5,
  },
  headerLabels: {
    color: color.charcoal,
    fontFamily: '"Gotham 5r", sans-serif',
  },
  studentNameColumn: {
    color: color.teal,
    fontFamily: '"Gotham 5r", sans-serif',
  }
};

export const COLUMNS = {
  NAME: 0,
  NUM_MULTIPLE_CHOICE_CORRECT: 1,
  NUM_MULTIPLE_CHOICE: 2,
  SUBMISSION_TIMESTAMP: 3,
};

export const studentOverviewDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  numMultipleChoiceCorrect: PropTypes.number,
  numMultipleChoice: PropTypes.number,
  submissionTimeStamp: PropTypes.string.isRequired,
  isSubmitted: PropTypes.bool.isRequired,
  url: PropTypes.string,
});

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
  };

  state = {
    [COLUMNS.NAME]: {
      direction: 'desc',
      position: 0
    }
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  onSort = (selectedColumn) => {
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
        <a href={rowData.url} style={styles.studentNameColumn}>{name}</a>
      );
    } else {
      return name;
    }
  };

  submissionTimestampColumnFormatter = (submissionTimeStamp, {rowData}) => {
    const isSubmitted = rowData.isSubmitted;

    return (
      <div style={styles.main}>
        <div style={styles.text}>
          {submissionTimeStamp}
        </div>
        {isSubmitted &&
          <div style={styles.icon}>
            <FontAwesome id="checkmark" icon="check-circle"/>
          </div>
        }
      </div>
    );
  };

  getColumns = (sortable) => {
    let dataColumns = [
      {
        property: 'name',
        header: {
          label: i18n.studentNameHeader(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.name},
            }
          },
          transforms: [sortable],
        },
        cell: {
          format: this.nameCellFormatter,
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.studentNameColumn,
            },
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
              ...{width: TABLE_COLUMN_WIDTHS.numMultipleChoiceCorrect},
            }
          },
        },
        cell: {
          props: {style: tableLayoutStyles.cell},
        }
      },
      {
        property: 'numMultipleChoice',
        header: {
          label: i18n.numMultipleChoice(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.numMultipleChoice},
            }
          },
        },
        cell: {
          props: {style: tableLayoutStyles.cell},
        }
      },
      {
        property: 'submissionTimeStamp',
        header: {
          label: i18n.submissionTimestamp(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.timeStamp},
            }
          },
          transforms: [sortable],
        },
        cell: {
          format: this.submissionTimestampColumnFormatter,
          props: {style: tableLayoutStyles.cell},
        }
      },
    ];
    return dataColumns;
  };

  render() {
    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, sortableOptions);
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
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="id" />
      </Table.Provider>
    );
  }
}

export default SubmissionStatusAssessmentsTable;
