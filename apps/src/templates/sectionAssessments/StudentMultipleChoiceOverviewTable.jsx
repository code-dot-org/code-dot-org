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
  timeStamp: TABLE_WIDTH / 5
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
  PERCENT_CORRECT: 3,
  SUBMISSION_TIMESTAMP: 4,
};

const studentOverviewDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  numMultipleChoiceCorrect: PropTypes.number.isRequired,
  numMultipleChoice: PropTypes.number.isRequired,
  percentCorrect: PropTypes.string.isRequired,
  submissionTimestamp: PropTypes.string,
  submissionStatus: PropTypes.string,
});

class StudentAssessmentOverviewTable extends Component {
  static propTypes= {
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

  submissionTimestampColumnFormatter = (submissionTimeStamp, {rowData}) => {
    const submissionStatus = rowData.submissionStatus;

    if (submissionStatus === 'Completed') {
      return (
        <div style={styles.main}>
          <div style={styles.text}>
            {submissionTimeStamp}
          </div>
          <div style={styles.icon}>
            <FontAwesome id="checkmark" icon="check-circle"/>
          </div>
        </div>
      );
    } else {
      return submissionStatus;
    }
  };

  getColumns = (sortable) => {
    let dataColumns = [
      {
        property: 'name',
        header: {
          label: i18n.studentName(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.name},
            }
          },
          transforms: [sortable],
        },
        cell: {
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
        property: 'percentCorrect',
        header: {
          label: i18n.percentCorrect(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.percentCorrect},
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

export default StudentAssessmentOverviewTable;
