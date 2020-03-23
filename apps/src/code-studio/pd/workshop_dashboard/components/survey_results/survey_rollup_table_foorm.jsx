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
    console.log('in get parsed data');
    if (overall && overall.averages) {
      Object.keys(overall.averages).forEach(surveyName => {
        Object.keys(overall.averages[surveyName]).forEach(questionId => {
          const questionData = this.props.questions[surveyName][questionId];
          let overallQuestionAverages =
            overall.averages[surveyName][questionId];
          let thisWorkshopAverages =
            thisWorkshop.averages[surveyName] &&
            thisWorkshop.averages[surveyName][questionId];
          let parsedQuestionAverages = {};
          // only display matrix questions for now
          if (questionData.type === 'matrix') {
            console.log('question is a matrix');
            parsedQuestionAverages[questionData.title] = {
              thisWorkshop:
                thisWorkshopAverages && thisWorkshopAverages.average,
              overall: overallQuestionAverages.average
            };
            let thisWorkshopRows =
              thisWorkshopAverages && thisWorkshopAverages.rows;
            Object.keys(overallQuestionAverages.rows).forEach(rowId => {
              console.log(`adding row ${rowId}`);
              parsedQuestionAverages[questionData.rows[rowId]] = {
                thisWorkshop: thisWorkshopRows && thisWorkshopRows[rowId],
                overall: overallQuestionAverages.rows[rowId]
              };
            });
            parsedData.push({
              orderedData: parsedQuestionAverages,
              denominator: Object.keys(questionData.columns).length
            });
            console.log('added to parsed data');
          }
        });
      });
    }
    console.log(`parsed data length: ${parsedData.length}`);
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
            // return (
            //   <MatrixAverages
            //     orderedData={matrixData.orderedData}
            //     denominator={matrixData.denominator}
            //     key={key}
            //   />
            //   );
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
