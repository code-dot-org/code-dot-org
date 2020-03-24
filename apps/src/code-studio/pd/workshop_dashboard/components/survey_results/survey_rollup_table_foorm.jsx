import React from 'react';
import PropTypes from 'prop-types';
import {Table} from 'react-bootstrap';

export default class SurveyRollupTableFoorm extends React.Component {
  static propTypes = {
    workshopRollups: PropTypes.object.isRequired,
    questions: PropTypes.object.isRequired,
    courseName: PropTypes.string.isRequired
  };

  getParsedData() {
    const {workshopRollups} = this.props;
    let parsedData = [];
    const overall = workshopRollups.overall;
    const thisWorkshop = workshopRollups.single_workshop;
    const questions = workshopRollups.questions;
    if (overall && overall.averages) {
      Object.keys(overall.averages).forEach(questionId => {
        const questionData = questions[questionId];
        let overallQuestionAverages = overall.averages[questionId];
        let thisWorkshopAverages = thisWorkshop.averages[questionId];
        let parsedQuestionAverages = {};
        // only display matrix questions for now
        if (questionData.type === 'matrix') {
          parsedQuestionAverages[questionData.header] = {
            thisWorkshop: thisWorkshopAverages && thisWorkshopAverages.average,
            overall: overallQuestionAverages.average
          };
          let thisWorkshopRows =
            thisWorkshopAverages && thisWorkshopAverages.rows;
          Object.keys(overallQuestionAverages.rows).forEach(rowId => {
            parsedQuestionAverages[questionData.rows[rowId]] = {
              thisWorkshop: thisWorkshopRows && thisWorkshopRows[rowId],
              overall: overallQuestionAverages.rows[rowId]
            };
          });
          parsedData.push({
            orderedData: parsedQuestionAverages,
            denominator: questionData.column_count,
            question: questionData.title,
            header: questionData.header
          });
        }
      });
    }
    return parsedData;
  }

  render() {
    const parsedData = this.getParsedData();
    return (
      <Table>
        <thead>
          <tr>
            <th />
            <th>Average for this workshop</th>
            <th>Average across all {this.props.courseName} workshops</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total Responses</td>
            <td>{this.props.workshopRollups.single_workshop.response_count}</td>
            <td>{this.props.workshopRollups.overall.response_count}</td>
          </tr>
          {parsedData.map(matrixData => {
            return Object.keys(matrixData.orderedData).map(question => {
              const answerData = matrixData.orderedData[question];
              return (
                <tr>
                  <td>{question}</td>
                  {Object.keys(answerData).map(answerId => {
                    return (
                      <td key={answerId}>
                        {answerData[answerId]} / {matrixData.denominator}
                      </td>
                    );
                  })}
                </tr>
              );
            });
          })}
        </tbody>
      </Table>
    );
  }
}
