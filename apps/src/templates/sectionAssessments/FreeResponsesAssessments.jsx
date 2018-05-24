import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import MultipleChoiceAnswerCell from './MultipleChoiceAnswerCell';

export const COLUMNS = {
  STUDENT: 0,
  RESPONSE: 1,
};

const studentAnswerDataPropType = PropTypes.shape({
  id:  PropTypes.number,
  studentId: PropTypes.string,
  name: PropTypes.string,
  studentAnswers: PropTypes.array,
});

const questionDataPropType = PropTypes.shape({
  id: PropTypes.number,
  question: PropTypes.number.isRequired,
  questionText: PropTypes.string.isRequired,
});

class FreeResponsesAssessments extends Component {
  static propTypes= {
    questionData: PropTypes.arrayOf(questionDataPropType),
    studentAnswerData: PropTypes.arrayOf(studentAnswerDataPropType)
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
        sortingOrder: {
          FIRST: 'asc',
          asc: 'desc',
          desc: 'asc',
        },
        selectedColumn
      })
    });
  };

  studentResponseColumnFormatter = (studentAnswers, {rowData, rowIndex, columnIndex}) => {

    // const questionObj = this.props.questionData.map(questionArr => {
    //   return questionArr.question
    // });

    const questionObj = this.props.questionData;
    const questionInfo = questionObj.map(quest => {
        return quest.question
    })

    console.log('what is questionObj', questionInfo);

    const studentData = this.props.studentAnswerData[rowIndex].studentAnswers;
    const studentResponse = studentData.map((student, index) => {
      if (student.question === questionInfo) {
        console.log('studentquestion', student.question);
        console.log('questionInfo', questionInfo)
        console.log('studentResponse', student.response);
        return student.response
      }
    });

    console.log('student response,', studentResponse);


    // let studentResponse = '';
    // if(this.props.studentAnswerData[rowIndex]) {
    //   studentResponse = this.props.studentAnswerData[rowIndex]
    //   .studentAnswers.filter(( item ) => {
    //     console.log('studentResponse--->', studentResponse);
    //       if(item.question == rowData.id) {
    //         return true;
    //       }
    //   }).response;
    // }
    // console.log('rowData', rowData);
    // const info = this.props.questionAnswerData
    // console.log('ha', info);
    // const find = info.map(item => {
    //   return item.id
    //  })
    //  console.log('find', find);

    // const studentData = this.props.studentAnswerData[rowIndex].studentAnswers;
    // console.log('data is-->', studentData);
    // const studentResponse = studentData.map((student, index) => {
    //   if (student.question === find[index]) {
    //   //   console.log('what is rowid-->', rowData.id);
    //   console.log('need answer', find[index]);
    //     console.log('item ', student.question)
    //     console.log('find question', find[index]);
    //     console.log('response', student.response);

    //    return student.response;

    //   }
    // });

    // console.log('studentResponse-->', studentResponse);


    return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        displayContent={studentResponse}
      />
    );
  };

  studentNameColumnFormatter = (studentAnswers, {rowData, rowIndex}) => {
    const studentName = this.props.studentAnswerData[rowIndex].name;
    console.log('what is the result', rowData.id );
    return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        displayContent={studentName}
      />
    );
  };

  getColumns = (sortable, index) => {
    let dataColumns = [
      {
        property: 'studentName',
        header: {
          label: i18n.studentName(),
          props: {style: tableLayoutStyles.headerCell},
        },
        cell: {
          format: this.studentNameColumnFormatter,
          props: {style:tableLayoutStyles.cell},
        }
      },
      {
        property: 'studentResponse',
        header: {
          label: i18n.response(),
          props: {style: tableLayoutStyles.headerCell},
        },
        cell: {
          format: this.studentResponseColumnFormatter,
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
    })(this.props.studentAnswerData);

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

export default FreeResponsesAssessments;
