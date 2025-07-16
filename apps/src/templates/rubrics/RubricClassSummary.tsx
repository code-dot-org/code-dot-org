import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {
  BodyTwoText,
  Heading4,
  StrongText,
} from '@code-dot-org/component-library/typography';
import classnames from 'classnames';
import React, {useMemo, useState} from 'react';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import Chart from '@cdo/apps/templates/rubrics/Chart';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {Rubric, TeacherEvaluations} from './types';

import style from './rubrics.module.scss';

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

/** The summary data for a particular learning goal */
interface StudentEvalData {
  /** The name of the learning goal in question. */
  name: string;
  /** A set of evaluations for each score */
  data: {
    /** The name of the score */
    name: string;
    /**
     * The number of students that achieved that score for the given learning goal.
     */
    value: number;
  }[];
}

const RubricClassSummary: React.FunctionComponent<RubricClassSummaryProps> = ({
  rubric,
  teacherEval,
}) => {
  const learningGoals = rubric.learningGoals;
  const rubricSummaryChartType = 'rubricFABSummaryChartType';
  const [chartType, setChartType] = useState<string>(
    tryGetSessionStorage(rubricSummaryChartType, 'pies') || 'pies'
  );

  return useMemo(() => {
    // The possible scores
    const labels = [
      'Unsubmitted',
      'None',
      'Limited',
      'Convincing',
      'Extensive',
    ];

    // Get the assigned score for every student for the given learning goals
    const fullValues: StudentEvalData[] = learningGoals.map(learningGoal => ({
      name: learningGoal.learningGoal,
      // Count the occurances for each score for this learning goal
      data: labels.map(label => {
        const value = (teacherEval || []).reduce(
          (acc, value) =>
            (value[learningGoal.id] || labels[0]) === label ? acc + 1 : acc,
          0
        );

        return {
          name: label,
          value,
        };
      }),
    }));

    // Get the student names that match each data point on the graph so we can
    // show them within the popover tooltip.
    const fullNames = learningGoals.map(learningGoal =>
      labels.map(label =>
        (teacherEval || [])
          .filter(value => (value[learningGoal.id] || labels[0]) === label)
          .map(
            value =>
              `${value.user_name}${
                value.user_family_name ? ` ${value.user_family_name}` : ''
              }`
          )
      )
    );

    const haveFullData = fullValues.length > 0;

    return (
      <div className={style.settingsGroup}>
        <Heading4 className={style.settingsSummaryHeader}>
          <span>{i18n.rubricClassroomScoreSummary()}</span>
          <SegmentedButtons
            size="s"
            className={style.settingsSummarySegmentedButtons}
            selectedButtonValue={chartType}
            onChange={value => {
              trySetSessionStorage(rubricSummaryChartType, value);
              setChartType(value);
            }}
            buttons={[
              {
                label: 'Full',
                value: 'full',
              },
              {
                label: 'By Goal',
                value: 'pies',
              },
            ]}
          />
        </Heading4>
        {chartType === 'full' && (
          <div
            className={classnames(
              style.settingsContainers,
              style.summaryItemContainer
            )}
          >
            <>
              {!haveFullData && <Spinner />}
              {haveFullData && (
                <Chart
                  style={{
                    height: '425px',
                    width: '100%',
                  }}
                  option={{
                    renderer: 'svg',
                    radiusAxis: {
                      label: {show: false},
                      labelLine: {show: false},
                      axisLine: {show: false},
                      axisLabel: {show: false},
                      axisTick: {show: false},
                    },
                    polar: {
                      center: ['50%', '45%'],
                      radius: '90%',
                    },
                    avoidLabelOverlap: true,
                    color: Object.values(COLORS),
                    legend: {
                      show: true,
                      bottom: 0,
                    },
                    angleAxis: {
                      type: 'category',
                      data: learningGoals.map(
                        learningGoal => learningGoal.learningGoal
                      ),
                      axisTick: {show: false},
                      axisLine: {show: false},
                      axisLabel: {
                        lineHeight: 16,
                        overflow: 'break',
                        width: 125,
                      },
                    },
                    series: labels.map((label, i) => ({
                      name: label,
                      data: fullValues.map(values => values.data[i].value),
                      type: 'bar',
                      coordinateSystem: 'polar',
                      stack: 'a',
                      emphasis: {
                        focus: 'item',
                      },
                    })),
                    tooltip: {
                      confine: true,
                      trigger: 'item',
                      formatter: (params: {
                        data: {
                          name: string;
                          value: number;
                        };
                        percent: number;
                        name: string;
                        seriesName: string;
                        dataIndex: number;
                        color: string;
                      }) =>
                        [
                          // Tooltip firsts prints the name of the learning goal
                          `<strong>${params.name}</strong>`,
                          // Then the label and value
                          `<strong style="color: ${params.color};">${params.seriesName}</strong>: ${params.data}`,
                          ...(fullNames[params.dataIndex]?.[
                            labels.indexOf(params.seriesName)
                          ] || []),
                        ].join('<br/>'),
                      axisPointer: {
                        type: 'shadow',
                      },
                    },
                  }}
                />
              )}
            </>
          </div>
        )}
        {chartType === 'pies' && (
          <div className={style.summaryContainer}>
            {learningGoals.map((learningGoal, learningGoalIndex) => {
              const values = fullValues[learningGoalIndex].data;
              const names = fullNames[learningGoalIndex];
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
                    <Chart
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
        )}
      </div>
    );
  }, [teacherEval, learningGoals, chartType]);
};

export default RubricClassSummary;
