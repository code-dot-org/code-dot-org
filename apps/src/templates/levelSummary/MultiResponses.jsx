import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import styles from './summary.module.scss';
import {Chart} from 'react-google-charts';
import color from '@cdo/apps/util/color';

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
  const answers = scriptData.level.properties.answers;
  const answerData = useMemo(
    () => multiAnswerCounts(scriptData.responses, answers.length),
    [scriptData.responses, answers.length]
  );
  const answerMax = useMemo(
    () => Math.max(...Object.values(answerData)),
    [answerData]
  );
  const correctAnswers = useMemo(
    () =>
      answers.reduce((acc, cur, i) => {
        if (cur.correct) {
          acc.push([...LETTERS][i]);
        }
        return acc;
      }, []),
    [answers]
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
