import React from 'react';
import PropTypes from 'prop-types';
import * as Table from 'reactabular-table';

export default class SurveyRollupTableFoorm extends React.Component {
  static propTypes = {
    workshopRollups: PropTypes.object.isRequired,
    questions: PropTypes.object.isRequired,
    courseName: PropTypes.string.isRequired
  };

  renderTableRow(title, answers, denominator, isHeader) {
    return (
      <tr style={isHeader ? {borderTop: 'solid'} : {}}>
        <td style={isHeader ? {} : {paddingLeft: '60px'}}>{title}</td>
        {answers.map((answer, i) => {
          return (
            <td key={i}>
              {answer} / {denominator}
            </td>
          );
        })}
      </tr>
    );
  }

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
      Object.keys(overall.averages).forEach(questionId => {
        const questionData = questions[questionId];
        let overallQuestionAverages = overall.averages[questionId];
        let thisWorkshopAverages = thisWorkshop.averages[questionId];
        let denominator = questionData.column_count;
        // only display matrix questions for now
        if (questionData.type === 'matrix') {
          // add header data
          rows.push({
            question: {
              text: questionData.header,
              type: 'overall'
            },
            thisWorkshop: thisWorkshopAverages
              ? `${thisWorkshopAverages.average} / ${denominator}`
              : '',
            overall: `${overallQuestionAverages.average} / ${denominator}`,
            id: `${questionId}-header`,
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
          let thisWorkshopRows =
            thisWorkshopAverages && thisWorkshopAverages.rows;
          Object.keys(overallQuestionAverages.rows).forEach(rowId => {
            rows.push({
              question: {
                text: questionData.rows[rowId],
                type: 'question'
              },
              thisWorkshop: thisWorkshopRows
                ? `${thisWorkshopRows[rowId]} / ${denominator}`
                : '',
              overall: `${
                overallQuestionAverages.rows[rowId]
              } / ${denominator}`,
              id: rowId
            });
          });
        }
      });
    }
    return rows;
  }

  getTableColumns(courseName) {
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
                  ? {paddingLeft: '30px'}
                  : {paddingLeft: '60px'}
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
          label: `Average across all ${courseName} workshops`
        }
      }
    ];
  }

  render() {
    const rows = this.getTableRows();
    const columns = this.getTableColumns(this.props.courseName);
    return (
      <Table.Provider className="table table-bordered" columns={columns}>
        <Table.Header />
        <Table.Body
          rows={rows}
          rowKey="id"
          onRow={row => {
            return {style: row.isHeader ? {borderTop: 'solid'} : {}};
          }}
        />
      </Table.Provider>
    );
  }
}
