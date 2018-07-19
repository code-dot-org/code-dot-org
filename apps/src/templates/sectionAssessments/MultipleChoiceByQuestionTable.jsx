import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import color from "@cdo/apps/util/color";
import MultipleChoiceAnswerCell from './MultipleChoiceAnswerCell';

const PADDING = 15;

const styles = {
  studentNameColumnHeader: {
    padding: PADDING,
  },
  studentNameColumnCell : {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: 200,
    padding: PADDING,
    verticalAlign: 'top',
  },
  responseColumnHeader: {
    padding: PADDING,
  },
  noResponse: {
    color: color.lighter_gray,
  }
};

export const COLUMNS = {
  NAME: 0,
  ANSWER: 1,
};

const studentAnswerPropType = PropTypes.shape({
  id:  PropTypes.number,
  name: PropTypes.string,
  answer: PropTypes.string,
});

class MultipleChoiceByQuestionTable extends Component {
  static propTypes= {
    studentAnswers: PropTypes.arrayOf(studentAnswerPropType),
    correctAnswer: PropTypes.string,
  };

  state = {
    [COLUMNS.ANSWER]: {
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
        sortingOrder: {
          FIRST: 'asc',
          asc: 'desc',
          desc: 'asc',
        },
        selectedColumn
      })
    });
  };

  answerCellFormatter = (answer, {rowData, columnIndex, rowIndex, property}) => {
    return (
        <MultipleChoiceAnswerCell
          id={rowData.id}
          displayAnswer={answer}
          isCorrectAnswer={this.props.correctAnswer === answer}
        />
    );
  };

  getColumns = (sortable, index) => {
    let dataColumns = [
      {
        property: 'name',
        header: {
          label: i18n.studentName(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.studentNameColumnHeader,
            }
          },
        },
        cell: {
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.studentNameColumnCell,
            }
          },
        }
      },
      {
        property: 'answer',
        header: {
          label: i18n.answer(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.responseHeaderCell,
            }
          },
        },
        cell: {
          format: this.answerCellFormatter,
          props: {style:tableLayoutStyles.cell},
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
    })(this.props.studentAnswers);

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

export default MultipleChoiceByQuestionTable;
