// Shows rollup data from Foorm surveys. Shows average data for this workshop
// and across all workshops for this course
// TODO: show facilitator averages
import React from 'react';
import PropTypes from 'prop-types';
import * as Table from 'reactabular-table';

const styles = {
  title: {
    paddingLeft: '30px'
  },
  question: {
    paddingLeft: '60px'
  },
  headerRow: {
    borderTop: 'solid'
  }
};

export default class SurveyRollupTableFoorm extends React.Component {
  static propTypes = {
    workshopRollups: PropTypes.object.isRequired,
    questions: PropTypes.object.isRequired,
    courseName: PropTypes.string.isRequired
  };

  // parse row data into format reactabular-table can parse. Each row may contain the following data:
  // {question: {text: <question-text>, type: overall/title/question},
  //             thisWorkshop: <this workshop average>, overall: <overall average>,
  //             id: <id>, isHeader: true/false}
  getTableRows() {
    const {workshopRollups} = this.props;
    let rows = [
      {
        question: {
          text: 'Total Responses',
          type: 'overall'
        },
        thisWorkshop: workshopRollups.single_workshop.response_count,
        overall: workshopRollups.overall.response_count,
        id: 'total_responses'
      }
    ];
    const overall = workshopRollups.overall;
    const thisWorkshop = workshopRollups.single_workshop;
    const questions = workshopRollups.questions;
    if (overall && overall.averages) {
      for (const questionId in overall.averages) {
        const questionData = questions[questionId];
        let overallQuestionAverages = overall.averages[questionId];
        let thisWorkshopAverages = thisWorkshop.averages[questionId];
        // only display matrix questions for now
        if (questionData.type === 'matrix') {
          this.parseMatrixData(
            rows,
            questionData,
            questionId,
            thisWorkshopAverages,
            overallQuestionAverages
          );
        } else if (
          questionData.type === 'scale' ||
          questionData.type === 'singleSelect' ||
          questionData.type === 'multiSelect'
        ) {
          this.parseSelectData(
            rows,
            questionData,
            questionId,
            thisWorkshopAverages,
            overallQuestionAverages
          );
        }
      }
    }
    return rows;
  }

  // get column configuration information
  getTableColumns() {
    return [
      {
        property: 'question',
        cell: {
          formatters: [question => question.text],
          transforms: [
            question => ({
              style:
                question.type === 'overall'
                  ? {}
                  : question.type === 'title'
                  ? styles.title
                  : styles.question
            })
          ]
        }
      },
      {
        property: 'thisWorkshop',
        header: {
          label: 'Average for this workshop'
        }
      },
      {
        property: 'overall',
        header: {
          label: `Average across all ${this.props.courseName} workshops`
        }
      }
    ];
  }

  // parse row data for a set of matrix answers
  parseMatrixData(
    rows,
    questionData,
    questionId,
    thisWorkshopAverages,
    overallQuestionAverages
  ) {
    let denominator = questionData.column_count;
    // add matrix category
    rows.push({
      question: {
        text: questionData.header,
        type: 'overall'
      },
      thisWorkshop: thisWorkshopAverages
        ? `${thisWorkshopAverages.average} / ${denominator}`
        : '',
      overall: `${overallQuestionAverages.average} / ${denominator}`,
      id: `${questionId}-category`,
      isHeader: true
    });
    // add top level question
    rows.push({
      question: {
        text: questionData.title,
        type: 'title'
      },
      id: questionId
    });
    // add individual rows
    let thisWorkshopRows = thisWorkshopAverages && thisWorkshopAverages.rows;
    for (const rowId in overallQuestionAverages.rows) {
      rows.push({
        question: {
          text: questionData.rows[rowId],
          type: 'question'
        },
        thisWorkshop: thisWorkshopRows
          ? `${thisWorkshopRows[rowId]} / ${denominator}`
          : '',
        overall: `${overallQuestionAverages.rows[rowId]} / ${denominator}`,
        id: rowId
      });
    }
  }

  // parse row data for a set of select answers
  parseSelectData(
    rows,
    questionData,
    questionId,
    thisWorkshopAverage,
    overallQuestionAverage
  ) {
    let denominator = questionData.column_count;
    rows.push({
      question: {
        text: questionData.title,
        type: 'overall'
      },
      thisWorkshop: thisWorkshopAverage
        ? `${thisWorkshopAverage} / ${denominator}`
        : '',
      overall: `${overallQuestionAverage} / ${denominator}`,
      id: questionId,
      isHeader: true
    });
  }

  render() {
    const rows = this.getTableRows();
    const columns = this.getTableColumns();
    return (
      <Table.Provider className="table table-bordered" columns={columns}>
        <Table.Header />
        <Table.Body
          rows={rows}
          rowKey="id"
          onRow={row => {
            return {style: row.isHeader ? styles.headerRow : {}};
          }}
        />
      </Table.Provider>
    );
  }
}
