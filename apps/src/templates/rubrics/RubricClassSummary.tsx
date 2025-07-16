import {
  BodyTwoText,
  Heading4,
  StrongText,
} from '@code-dot-org/component-library/typography';
import classnames from 'classnames';
// @ts-expect-error - this is OK because the bundler will handle the ambiguity
import {PieChart} from 'echarts/charts';
import {
  // @ts-expect-error - this is OK because the bundler will handle the ambiguity
  GridComponent,
  // @ts-expect-error - this is OK because the bundler will handle the ambiguity
  LegendComponent,
  // @ts-expect-error - this is OK because the bundler will handle the ambiguity
  TooltipComponent,
  // @ts-expect-error - this is OK because the bundler will handle the ambiguity
} from 'echarts/components';
// @ts-expect-error - this is OK because the bundler will handle the ambiguity
import * as echarts from 'echarts/core';
// @ts-expect-error - this is OK because the bundler will handle the ambiguity
import {LabelLayout} from 'echarts/features';
// @ts-expect-error - this is OK because the bundler will handle the ambiguity
import {SVGRenderer} from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import React, {useMemo} from 'react';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {Rubric, TeacherEvaluations} from './types';

import style from './rubrics.module.scss';

// @ts-expect-error - this is OK because the bundler will handle the ambiguity
echarts.use([
  SVGRenderer,
  LabelLayout,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  PieChart,
]);

const getCSSVariable: (name: string) => string = name =>
  typeof window !== 'undefined'
    ? window.getComputedStyle(document.body).getPropertyValue(`--${name}`) || ''
    : '';

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
  const students = useAppSelector(
    state => state.teacherSections.selectedStudents
  );

  return useMemo(
    () => (
      <div className={style.settingsGroup}>
        <Heading4>{i18n.rubricClassroomScoreSummary()}</Heading4>
        <div className={style.summaryContainer}>
          {learningGoals.map(learningGoal => {
            // The possible scores
            const labels = [
              'Unsubmitted',
              'None',
              'Limited',
              'Convincing',
              'Extensive',
            ];

            // Get the assigned score for every student for the given learning goal
            const results = (teacherEval || []).map(
              studentEval => studentEval[learningGoal.id] || labels[0]
            );

            // Count the occurances for each score for this learning goal
            const values = labels.map(label => {
              const value = results.reduce(
                (acc, value) => (value === label ? acc + 1 : acc),
                0
              );

              return {
                name: label,
                value,
              };
            });

            // Get the student names that match each data point on the graph so we can
            // show them within the popover tooltip.
            const names = labels.map(label => {
              return (
                results
                  .map((value, i) => [value, i])
                  .filter(([value, _]) => value === label) as [string, number][]
              ).map(
                ([_, i]) =>
                  `${students[i]?.name || ''}${
                    students[i]?.familyName ? ` ${students[i].familyName}` : ''
                  }`
              );
            });

            const haveData = values.some(n => n.value !== 0);

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
                  <ReactEChartsCore
                    echarts={echarts}
                    style={{
                      height: '250px',
                      width: '100%',
                    }}
                    option={{
                      renderer: 'svg',
                      avoidLabelOverlap: true,
                      color: Object.values(COLORS),
                      legend: {
                        show: true,
                        bottom: 0,
                      },
                      series: [
                        {
                          name: learningGoal.learningGoal,
                          type: 'pie',
                          radius: '70%',
                          stillShowZeroSum: false,
                          data: values,
                          center: ['50%', '37.5%'],
                          itemStyle: {
                            borderRadius: 3,
                            borderColor: getCSSVariable(
                              'background-neutral-primary'
                            ),
                            borderWidth: 3,
                          },
                          label: {
                            show: false,
                          },
                          emphasis: {
                            label: {
                              show: false,
                            },
                            labelLine: {
                              show: false,
                            },
                          },
                          labelLine: {
                            show: false,
                          },
                        },
                      ],
                      tooltip: {
                        confine: true,
                        trigger: 'item',
                        formatter: (params: {
                          data: {
                            name: string;
                            value: number;
                          };
                          percent: number;
                          seriesName: string;
                          dataIndex: number;
                          color: string;
                        }) =>
                          [
                            // Tooltip firsts prints the name of the graph essentially
                            `<strong>${params.seriesName}</strong>`,
                            // Then the label and value
                            `<strong style="color: ${params.color};">${
                              params.data.name
                            }</strong>: ${
                              params.data.value
                            } (${params.percent.toFixed(2)}%)`,
                            // Then a set of student names
                            ...names[params.dataIndex],
                          ].join('<br/>'),
                        axisPointer: {
                          type: 'shadow',
                        },
                      },
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    ),
    [teacherEval, learningGoals, students]
  );
};

export default RubricClassSummary;
