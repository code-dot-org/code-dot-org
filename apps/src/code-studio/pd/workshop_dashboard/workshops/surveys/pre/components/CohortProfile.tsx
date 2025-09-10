import {Box} from '@mui/material';
import React, {useMemo} from 'react';

import {SurveyQuestions} from '../../../../WorkshopFormTemplate/types';
import {useWorkshopContext} from '../../../WorkshopLayout';
import BarChartGroup, {
  BarChartGroupProps,
} from '../../components/BarChartGroup';
import {SelectCard} from '../../components/SelectCard';

import styles from '../../../workshop.module.scss';

function bucketizeYearsTeaching(value: string): string {
  const num = parseInt(value, 10);
  if (isNaN(num)) return value;

  if (num <= 2) return '0–2';
  if (num <= 7) return '3–7';
  if (num <= 15) return '8–15';
  return '16+';
}

function buildBarCharts(questions: SurveyQuestions) {
  const charts: BarChartGroupProps[] = [];

  const EXPERIENCE_BUCKETS = ['0–2', '3–7', '8–15', '16+'];

  const buildGroupedChart = (key: keyof SurveyQuestions) => {
    const q = questions[key];
    if (!q || q.question_type !== 'text') return;

    const responses = q.results?.responses;
    if (!Array.isArray(responses)) return;

    const grouped = responses.reduce<Record<string, number>>((acc, val) => {
      const bucket = bucketizeYearsTeaching(val);
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {});

    const completeData = EXPERIENCE_BUCKETS.map(label => ({
      label,
      value: grouped[label] || 0,
    }));

    charts.push({
      title: q.question_short_text || q.question_text,
      data: completeData,
      xAxisLabel: 'Years taught',
      yAxisLabel: 'Responses',
    });
  };

  // 1. Years Teaching (all subjects)
  buildGroupedChart('years_teaching');

  // 2. Years Teaching CS
  buildGroupedChart('years_teaching_cs');

  // 3. Grade Levels
  const GRADE_LABELS_ORDER = [
    'Kindergarten',
    '1st grade',
    '2nd grade',
    '3rd grade',
    '4th grade',
    '5th grade',
    '6th grade',
    '7th grade',
    '8th grade',
    '9th grade',
    '10th grade',
    '11th grade',
    '12th grade',
    'N/A', // instead of 'Above 12th grade'
  ];

  const GRADE_SHORT_LABELS: Record<string, string> = {
    Kindergarten: 'K',
    '1st grade': '1',
    '2nd grade': '2',
    '3rd grade': '3',
    '4th grade': '4',
    '5th grade': '5',
    '6th grade': '6',
    '7th grade': '7',
    '8th grade': '8',
    '9th grade': '9',
    '10th grade': '10',
    '11th grade': '11',
    '12th grade': '12',
    'N/A': 'N/A',
  };

  const gradeQ = questions.grade;
  if (gradeQ?.question_type === 'multiSelect') {
    const breakdown = gradeQ.results?.breakdown;
    if (breakdown) {
      const labelToCount = Object.values(breakdown).reduce<
        Record<string, number>
      >((acc, item) => {
        acc[item.label] = item.count;
        return acc;
      }, {});

      const normalized = GRADE_LABELS_ORDER.filter(
        fullLabel => labelToCount[fullLabel]
      ).map(fullLabel => ({
        label: GRADE_SHORT_LABELS[fullLabel] ?? fullLabel,
        value: labelToCount[fullLabel] || 0,
      }));

      charts.push({
        title: gradeQ.question_short_text || gradeQ.question_text,
        data: normalized,
        xAxisLabel: 'Grade level',
        yAxisLabel: 'Responses',
      });
    }
  }

  return charts;
}

function buildSelectCards(questions: SurveyQuestions) {
  const keys = [
    'cdo_teaching_experience',
    'cdo_pd_experience',
    'highest_level_cs_education',
  ] as const;

  const result = [];

  for (const key of keys) {
    const q = questions[key];

    if (!q || q.question_type !== 'singleSelect') continue;

    const breakdown = q.results?.breakdown;
    if (!breakdown) continue;

    result.push({
      key,
      title: q.question_short_text || q.question_text,
      description: q.question_text,
      totalRespondents: q.results.total_responses ?? 0,
      items: Object.values(breakdown),
    });
  }

  return result;
}

export const CohortProfile = () => {
  const {surveys} = useWorkshopContext();

  const questions =
    surveys?.surveys?.pre_workshop?.categories?.cohort_profile?.questions;

  const barCharts = useMemo(() => {
    if (!questions) return [];
    return buildBarCharts(questions);
  }, [questions]);

  const selectCards = useMemo(() => {
    if (!questions) return [];
    return buildSelectCards(questions);
  }, [questions]);
  if (!questions) return null;

  return (
    <Box className={styles.surveyResultsContainer}>
      <Box className={styles.cardRow}>
        {barCharts.map(({title, data, xAxisLabel, yAxisLabel}) => (
          <BarChartGroup
            key={title}
            title={title}
            data={data}
            xAxisLabel={xAxisLabel}
            yAxisLabel={yAxisLabel}
          />
        ))}
      </Box>
      <Box className={styles.cardRow}>
        {selectCards.map(
          ({key, title, description, totalRespondents, items}) => (
            <SelectCard
              key={key}
              title={title}
              description={description}
              totalRespondents={totalRespondents}
              items={items}
              barLabel="Teachers"
            />
          )
        )}
      </Box>
    </Box>
  );
};

export default CohortProfile;
