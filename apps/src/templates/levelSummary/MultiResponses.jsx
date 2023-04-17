import React from 'react';
import PropTypes from 'prop-types';
import styles from './summary.module.scss';
import {Chart} from 'react-google-charts';
import color from '@cdo/apps/util/color';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const MultiResponses = ({scriptData, showCorrectAnswer = false}) => {
  const multiAnswerCounts = (responses, answerCount) => ({
    // Default to a count of 0 for each answer.
    ...Object.fromEntries([...LETTERS.slice(0, answerCount)].map(l => [l, 0])),
    // Overwrite the count for any answers that have student responses.
    ...responses.reduce((acc, curr) => {
      const letter = LETTERS.at(curr.text);
      acc[letter] = acc[letter] ? acc[letter] + 1 : 1;
      return acc;
    }, {}),
    /*
    // FIXME: test data
    ...{
      A: 1,
      B: 4,
      C: 19,
      D: 0,
    },
    */
  });

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

  const answers = scriptData.level.properties.answers;
  const answerData = multiAnswerCounts(scriptData.responses, answers.length);
  const answerMax = Math.max(...Object.values(answerData));
  const correctAnswers = answers.reduce((acc, cur, i) => {
    if (cur.correct) {
      acc.push([...LETTERS][i]);
    }
    return acc;
  }, []);

  // FIXME: Is this too weird?
  const correctAnswerElement = document.getElementById(
    'summary-correct-answer'
  );
  if (showCorrectAnswer) {
    correctAnswerElement.classList.add(styles.correctAnswersContainer);
    correctAnswerElement.classList.remove('hide');
  } else {
    correctAnswerElement.classList.add('hide');
    correctAnswerElement.classList.remove(styles.correctAnswersContainer);
  }

  return (
    <div className={styles.multiChart}>
      {scriptData.responses.length > 0 && (
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
              // on top of the highest bar.
              maxValue: Math.ceil(answerMax * 1.2),
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
      )}
    </div>
  );
};

MultiResponses.propTypes = {
  scriptData: PropTypes.object,
  showCorrectAnswer: PropTypes.bool,
};

export default MultiResponses;
