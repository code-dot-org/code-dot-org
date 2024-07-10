import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {Chart} from 'react-google-charts';

import color from '@cdo/apps/util/color';

import styles from './summary.module.scss';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Return an object hash, where the keys are letters representing an answer
// and the values are the count of responses that chose that answer.
// Example:
//   {A: 1, B: 9, C: 2}
const multiAnswerCounts = (responses, answerCount) => ({
  // Default to a count of 0 for each answer.
  ...Object.fromEntries([...LETTERS.slice(0, answerCount)].map(l => [l, 0])),
  // Overwrite the count for any answers that have student responses.
  ...responses.reduce((acc, curr) => {
    // Each response can be an index or a comma-separated list of indices.
    const indices = curr.text.split(',');
    indices.forEach(index => {
      const letter = LETTERS.charAt(index);
      acc[letter] = acc[letter] ? acc[letter] + 1 : 1;
    });
    return acc;
  }, {}),
});

// Return row data in the format expected by Google Charts.
// Param `data` is the output of `multiAnswerCounts`.
// Optional param `highlightCorrect` is either false to render without
// highlighting, or an Array of the letters representing correct
// answers. Example:
//   multiChartData({A: 2, B: 0, C: 6}, ['A'])
const multiChartData = (data, highlightCorrect = false) => [
  ['Answer', 'Count', {role: 'annotation'}, {role: 'style'}],
  ...Object.entries(data).map(row => [
    ...row,
    row[1] +
      (highlightCorrect && highlightCorrect.includes(row[0]) ? '✔️' : ''),
    highlightCorrect
      ? highlightCorrect.includes(row[0])
        ? color.brand_primary_default
        : color.brand_primary_light
      : null,
  ]),
];

const MultiResponses = ({scriptData, showCorrectAnswer = false}) => {
  // Get the number of answers and a list of correct answers.
  // The correct answers will be the letters for the correct answers, ex. ['A', 'C']
  const [numAnswers, correctAnswers] = useMemo(() => {
    let answers = [];
    let correctIndices = [];
    if (scriptData.level.properties.answers) {
      // If the level is a multi/contained level, the answers are in the level properties.
      answers = scriptData.level.properties.answers;
      correctIndices = answers
        .filter(answer => answer.correct)
        .map(answer => answers.indexOf(answer));
    } else if (scriptData.level.properties.predict_settings) {
      // If the level is a predict level (lab2) the answers are in predict_settings.
      const predictSettings = scriptData.level.properties.predict_settings;
      // We should only be trying to load this component if this is a multiple choice question.
      if (predictSettings.multipleChoiceOptions) {
        answers = predictSettings.multipleChoiceOptions;

        // solution is a comma-separated list of strings.
        correctIndices = predictSettings.solution
          .split(',')
          .map(answer => answers.indexOf(answer));
      }
    }
    const correctAnswers = correctIndices.map(index => LETTERS.charAt(index));
    return [answers.length, correctAnswers];
  }, [
    scriptData.level.properties.answers,
    scriptData.level.properties.predict_settings,
  ]);

  const answerData = useMemo(
    () => multiAnswerCounts(scriptData.responses, numAnswers),
    [scriptData.responses, numAnswers]
  );
  const answerMax = useMemo(
    () => Math.max(...Object.values(answerData)),
    [answerData]
  );

  return (
    <div className={styles.multiChart}>
      <Chart
        chartType="ColumnChart"
        width="100%"
        height="340px"
        data={multiChartData(
          answerData,
          showCorrectAnswer ? correctAnswers : false
        )}
        options={{
          bar: {
            groupWidth: '80%',
          },
          colors: [color.brand_primary_default],
          annotations: {
            alwaysOutside: true,
            textStyle: {
              fontSize: 24,
              color: 'black',
            },
            stem: {
              color: 'none',
            },
          },
          legend: 'none',
          vAxis: {
            gridlines: {
              count: 0,
            },
            ticks: [],
            // Give some padding, so the annotation draws correctly
            // on top of the highest bar. Never set the max to 0.
            maxValue: Math.ceil(answerMax * 1.2) || 1,
          },
          hAxis: {
            textStyle: {
              fontSize: 24,
            },
          },
          chartArea: {
            width: '100%',
            height: '90%',
            left: 0,
            right: 0,
            top: 0,
          },
          tooltip: {
            trigger: 'none',
          },
          enableInteractivity: false,
        }}
      />
    </div>
  );
};

MultiResponses.propTypes = {
  scriptData: PropTypes.object,
  showCorrectAnswer: PropTypes.bool,
};

export const exportedForTesting = {multiAnswerCounts, multiChartData};
export default MultiResponses;
