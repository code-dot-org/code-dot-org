import classnames from 'classnames';
import React from 'react';
import Plot from 'react-plotly.js';

import {
  BodyTwoText,
  Heading4,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import i18n from '@cdo/locale';

import {Rubric, TeacherEvaluations} from './types';

import style from './rubrics.module.scss';

const COLORS = {
  NOT_STARTED: '#D1D4D8',
  NONE: '#ED6060',
  LIMITED: '#FFC55C',
  CONVINCING: '#9ADC99',
  EXTENSIVE: '#3EA33E',
};

interface RubricClassSummaryProps {
  rubric: Rubric;
  teacherEval: TeacherEvaluations;
}

const RubricClassSummary: React.FunctionComponent<RubricClassSummaryProps> = ({
  rubric,
  teacherEval,
}) => {
  const learningGoals = rubric.learningGoals;

  return (
    <div className={style.settingsGroup}>
      <Heading4>{i18n.rubricClassroomScoreSummary()}</Heading4>
      <div className={style.summaryContainer}>
        {learningGoals.map(learningGoal => {
          console.log(learningGoal);
          // Get the assigned score for every student for the given learning goal
          const results = (teacherEval || []).map(
            studentEval => studentEval[learningGoal.id]
          );
          // The possible scores
          const labels = [
            'Not Started',
            'None',
            'Limited',
            'Convincing',
            'Extensive',
          ];
          // Count the occurances for each score for this learning goal
          const values = labels.map(label =>
            results.reduce(
              (acc, value) =>
                value === label || (value === '' && label === 'Not Started')
                  ? acc + 1
                  : acc,
              0
            )
          );

          const haveData = values.some(n => n !== 0);

          return (
            <div
              className={classnames(
                style.settingsContainers,
                style.summaryItemContainer
              )}
              key={`learning-goal-summary-${learningGoal.id}`}
            >
              <BodyTwoText>
                <StrongText>{learningGoal.learningGoal}</StrongText>
              </BodyTwoText>
              {!haveData && <Spinner />}
              {haveData && (
                <Plot
                  data={[
                    {
                      type: 'pie',
                      // The value (number of students) for each pie wedge
                      values: values,
                      // The labels corresponding to each value
                      labels: labels,
                      // The actual text to display on each pie wedge
                      texttemplate:
                        '%{label}<br><b>%{value}</b> <b>(%{percent:.0%})</b>',
                      // The position of the text label. When specified, it will place a label even if
                      // the value is 0, so we need to handle that accordingly:
                      //   outside: external to the wedge
                      //   none: do not display the label (we want this for when there's no students)
                      textposition: values.map(value =>
                        value === 0 ? 'none' : 'outside'
                      ),
                      // Render the wedges in the order they are specified instead of sorting them
                      sort: false,
                      // Use the given colors for the corresponding values, given in the order the
                      // values are also given.
                      marker: {
                        colors: [
                          COLORS.NOT_STARTED,
                          COLORS.NONE,
                          COLORS.LIMITED,
                          COLORS.CONVINCING,
                          COLORS.EXTENSIVE,
                        ],
                        // The outline around all shapes
                        line: {
                          color: '#FFF',
                          width: 2,
                        },
                      },
                      // Shrinks the pie chart in extreme cases to ensure labels fit nicely
                      automargin: true,
                    },
                  ]}
                  layout={{
                    showlegend: false,
                    width: 315,
                    height: 170,
                    hovermode: false,
                    font: {
                      size: 10,
                    },
                    margin: {
                      b: 24,
                      l: 63,
                      t: 24,
                      r: 63,
                    },
                  }}
                  config={{
                    displayModeBar: false,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RubricClassSummary;
