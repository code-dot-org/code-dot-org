/**
 * Shows rollup data from Foorm surveys. Shows average data for this workshop
 * and across all workshops for this course
 * The rollup table can either be per facilitator or not. This means the question(s) were asked on a
 * per-facilitator basis. If it is per-facilitator, each question
 * will have the following data points (keys used in table are in parentheses):
 *  -average for this workshop for each facilitator (thisWorkshop-{facilitatorId})
 *  -average for each facilitator across all of their workshops (facilitatorAverage-{facilitatorId})
 *  -average for all workshops for this course (overall)
 *
 * If the data is not per-facilitator each question will have the following data points
 * (keys used in table are in parentheses):
 *  -average for this workshop (thisWorkshop)
 *  -average for each facilitator across all of their workshops (facilitatorAverage-{facilitatorId})
 *  -average for all workshops for this course (overall)
 **/
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
  },
  dateNotice: {
    textAlign: 'right'
  }
};

const INCLUDE_OVERALL = false;

export default class SurveyRollupTableFoorm extends React.Component {
  static propTypes = {
    workshopRollups: PropTypes.object.isRequired,
    courseName: PropTypes.string.isRequired,
    isPerFacilitator: PropTypes.bool.isRequired,
    facilitators: PropTypes.object
  };

  /**
   * Parse row data into format reactabular-table can parse.
   * The row may contain the following data:
   * {
   *  question: {text: <question-text>, type: overall/title/question},
   *  // if isPerFacilitator = false
   *  thisWorkshop: '5 / 7'
   *  // if isPerFacilitator = true, faciliator ids are 100, 200
   *  thisWorkshop-100: '3 / 7',
   *  thisWorkshop-200: '4 / 7',
   *  // for either type--average across all workshops for each facilitator
   *  facilitatorAverage-100: '4 / 7',
   *  facilitatorAverage-200: '3 / 7',
   *  // average across all workshops for this course
   *  overall: '6 / 7',
   *  id: <row-id>,
   *  isHeader: true/false
   * }
   **/
  getTableRows() {
    // add response counts for each category
    let rows = [];
    rows.push(this.getOverallCountsRow());

    // add rows for each question in rollup
    const overall = this.props.workshopRollups.overall;
    const thisWorkshop = this.props.workshopRollups.single_workshop;
    const overallFacilitator = this.props.workshopRollups.overall_facilitator;
    const questions = this.props.workshopRollups.questions;
    for (const questionId in questions) {
      const questionData = questions[questionId];
      let overallQuestionAverages = {};
      if (overall && overall.averages) {
        overallQuestionAverages = overall.averages[questionId];
      }
      let thisWorkshopAverages = this.props.isPerFacilitator
        ? {}
        : thisWorkshop.averages[questionId];
      let overallFacilitatorAverages = this.getFacilitatorAveragesForQuestion(
        overallFacilitator,
        questionId
      );
      if (this.props.isPerFacilitator && thisWorkshop) {
        thisWorkshopAverages = this.getFacilitatorAveragesForQuestion(
          thisWorkshop,
          questionId
        );
      }
      if (questionData.type === 'matrix') {
        this.parseMatrixData(
          rows,
          questionData,
          questionId,
          thisWorkshopAverages,
          overallFacilitatorAverages,
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
          overallFacilitatorAverages,
          overallQuestionAverages
        );
      }
    }
    return rows;
  }

  // Get column configuration in reactabular-table format
  getTableColumns() {
    let columns = [
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
      }
    ];
    this.addThisWorkshopColumns(columns);
    if (INCLUDE_OVERALL) {
      columns.push({
        property: 'overall',
        header: {
          label: `Average across all ${this.props.courseName} workshops`
        }
      });
    }
    return columns;
  }

  // Add rollup data for a set of matrix questions
  parseMatrixData(
    rows,
    questionData,
    questionId,
    thisWorkshopAverages,
    overallFacilitatorAverages,
    overallQuestionAverages
  ) {
    // add overall averages for the matrix
    rows.push(
      this.getOverallMatrixData(
        questionData,
        overallQuestionAverages,
        questionId,
        thisWorkshopAverages,
        overallFacilitatorAverages
      )
    );

    // add top level question
    rows.push({
      question: {
        text: questionData.title,
        type: 'title'
      },
      id: questionId
    });

    // add individual rows
    const denominator = questionData.column_count;
    for (const rowId in questionData.rows) {
      let rowData = {
        question: {
          text: questionData.rows[rowId],
          type: 'question'
        },
        overall: INCLUDE_OVERALL
          ? this.getFormattedRowData(
              overallQuestionAverages.rows[rowId],
              denominator
            )
          : {},
        id: rowId
      };
      if (this.props.isPerFacilitator) {
        this.addPerQuestionAverageToRow(
          rowData,
          rowId,
          thisWorkshopAverages,
          denominator,
          'thisWorkshop'
        );
      } else if (thisWorkshopAverages && thisWorkshopAverages.rows) {
        rowData['thisWorkshop'] = this.getFormattedRowData(
          thisWorkshopAverages.rows[rowId],
          denominator
        );
      }
      this.addPerQuestionAverageToRow(
        rowData,
        rowId,
        overallFacilitatorAverages,
        denominator,
        'facilitatorAverage'
      );
      rows.push(rowData);
    }
  }

  // parse row data for a set of select answers
  parseSelectData(
    rows,
    questionData,
    questionId,
    thisWorkshopAverage,
    overallFacilitatorAverage,
    overallQuestionAverage
  ) {
    let denominator = questionData.column_count;
    let rowData = {
      question: {
        text: questionData.title,
        type: 'overall'
      },
      overall: INCLUDE_OVERALL
        ? this.getFormattedRowData(overallQuestionAverage, denominator)
        : {},
      id: questionId,
      isHeader: true
    };

    if (this.props.isPerFacilitator) {
      this.addPerFacilitatorAverageForSelect(
        rowData,
        thisWorkshopAverage,
        denominator,
        'thisWorkshop'
      );
    } else {
      rowData['thisWorkshop'] = this.getFormattedRowData(
        thisWorkshopAverage,
        denominator
      );
    }

    this.addPerFacilitatorAverageForSelect(
      rowData,
      overallFacilitatorAverage,
      denominator,
      'facilitatorAverage'
    );

    rows.push(rowData);
  }

  /** HELPER FUNCTIONS */

  // Get data row for average across all questions in a matrix
  getOverallMatrixData(
    questionData,
    overallQuestionAverages,
    questionId,
    thisWorkshopAverages,
    overallFacilitatorAverages
  ) {
    let denominator = questionData.column_count;
    let overallData = {
      question: {
        text: questionData.header,
        type: 'overall'
      },
      id: `${questionId}-category`,
      isHeader: true
    };
    if (INCLUDE_OVERALL) {
      overallData.overall = this.getFormattedRowData(
        overallQuestionAverages.average,
        denominator
      );
    }
    if (this.props.isPerFacilitator) {
      this.addFacilitatorAverageToRow(
        thisWorkshopAverages,
        overallData,
        denominator,
        'thisWorkshop'
      );
    } else if (thisWorkshopAverages) {
      overallData['thisWorkshop'] = this.getFormattedRowData(
        thisWorkshopAverages.average,
        denominator
      );
    }
    this.addFacilitatorAverageToRow(
      overallFacilitatorAverages,
      overallData,
      denominator,
      'facilitatorAverage'
    );
    return overallData;
  }

  // Get row data for response counts
  getOverallCountsRow() {
    const {workshopRollups} = this.props;
    let responseCounts = {
      question: {
        text: 'Total Responses',
        type: 'overall'
      },
      id: 'total_responses'
    };
    if (INCLUDE_OVERALL) {
      responseCounts.overall = workshopRollups.overall.response_count;
    }
    if (this.props.isPerFacilitator) {
      this.addPerFacilitatorResponseCounts(
        responseCounts,
        'thisWorkshop',
        workshopRollups.single_workshop
      );
    } else {
      responseCounts.thisWorkshop =
        workshopRollups.single_workshop.response_count;
    }

    this.addPerFacilitatorResponseCounts(
      responseCounts,
      'facilitatorAverage',
      workshopRollups.overall_facilitator
    );
    return responseCounts;
  }

  // Create column configurations for thisWorkshop
  // data points and add to columns array
  addThisWorkshopColumns(columns) {
    if (!this.props.isPerFacilitator) {
      columns.push({
        property: 'thisWorkshop',
        header: {
          label: 'Average for this workshop'
        }
      });
    }
    let columnLabels = [];
    for (const facilitator in this.props.facilitators) {
      columnLabels.push({
        thisWorkshopLabel: `${
          this.props.facilitators[facilitator]
        }'s average for this workshop`,
        averageLabel: `Average across all of ${
          this.props.facilitators[facilitator]
        }'s ${this.props.courseName} workshops`,
        id: facilitator
      });
    }
    for (const columnLabel of columnLabels) {
      if (this.props.isPerFacilitator) {
        columns.push({
          property: `thisWorkshop-${columnLabel.id}`,
          header: {
            label: columnLabel.thisWorkshopLabel
          }
        });
      }
      columns.push({
        property: `facilitatorAverage-${columnLabel.id}`,
        header: {
          label: columnLabel.averageLabel
        }
      });
    }
  }

  // format numerator and denominator into format for displaying in the table
  getFormattedRowData(numerator, denominator) {
    if (numerator === null || numerator === undefined || numerator === '') {
      return '';
    }
    return `${numerator} / ${denominator}`;
  }

  // Get per facilitator averages for this questionId
  getFacilitatorAveragesForQuestion(averages, questionId) {
    let result = {};
    for (const facilitator in averages) {
      if (averages[facilitator].averages[questionId]) {
        result[facilitator] = averages[facilitator].averages[questionId];
      }
    }
    return result;
  }

  // add overall average for each facilitator to the given row,
  // using the key ${key}-${facilitatorId}
  addFacilitatorAverageToRow(averages, row, denominator, key) {
    for (const facilitator in averages) {
      row[`${key}-${facilitator}`] = this.getFormattedRowData(
        averages[facilitator].average,
        denominator
      );
    }
  }

  // add average for each facilitator for the given rowId to the given row,
  // using the key ${key}-${facilitatorId}
  addPerQuestionAverageToRow(row, rowId, averages, denominator, key) {
    for (const facilitator in averages) {
      if (averages[facilitator].rows && averages[facilitator].rows[rowId]) {
        row[`${key}-${facilitator}`] = this.getFormattedRowData(
          averages[facilitator].rows[rowId],
          denominator
        );
      }
    }
  }

  // Add the number of responses per facilitator to the responseCounts array
  addPerFacilitatorResponseCounts(responseCounts, key, data) {
    for (const facilitator in this.props.facilitators) {
      responseCounts[`${key}-${facilitator}`] = data[facilitator]
        ? data[facilitator].response_count
        : 0;
    }
  }

  // Add per facilitator averages for a single-select question
  // to the given row, where the averages are an object
  // in the format {facilitatorId-1: 5,...}
  addPerFacilitatorAverageForSelect(row, averages, denominator, key) {
    for (const facilitator in averages) {
      row[`${key}-${facilitator}`] = this.getFormattedRowData(
        averages[facilitator],
        denominator
      );
    }
  }

  render() {
    const rows = this.getTableRows();
    const columns = this.getTableColumns();
    return (
      <div>
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
        <div style={styles.dateNotice}>
          The averages shown above are for workshops from May 2020 onwards.{' '}
          <br />
          Earlier averages can be found at{' '}
          <a href="/pd/workshop_dashboard/legacy_survey_summaries">
            Legacy Facilitator Survey Summaries
          </a>
          .
        </div>
      </div>
    );
  }
}
