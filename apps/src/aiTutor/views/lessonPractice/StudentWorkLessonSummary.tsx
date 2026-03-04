import React, {FC, useEffect, useState} from 'react';
import {Card, CardContent, CircularProgress, Typography} from '@mui/material';

import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

interface StudentWorkLessonSummaryProps {
  lessonId: number;
  unitId: number;
}

interface InsightResponse {
  json: string;
}

const StudentWorkLessonSummary: FC<StudentWorkLessonSummaryProps> = ({
  lessonId,
  unitId,
}) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = useAppSelector(state => state);
  console.log('state in StudentWorkLessonSummary', state);
  const userId = useAppSelector(state => state.currentUser.userId);

  //   useEffect(() => {
  //     const params = new URLSearchParams({
  //       lesson_id: lessonId.toString(),
  //       unit_id: unitId.toString(),
  //       student_id: studentId.toString(),
  //       section_id: sectionId.toString(),
  //     });

  //     setLoading(true);
  //     setError(null);

  //     HttpClient.fetchJson<InsightResponse>(
  //       `/student_snapshots/lesson_insight?${params}`
  //     )
  //       .then(response => {
  //         const jsonString = response?.value?.json || '';
  //         setSummary(jsonString);
  //       })
  //       .catch(err => {
  //         console.error('Error fetching student work lesson summary', err);
  //         setError('Unable to load lesson summary.');
  //       })
  //       .finally(() => setLoading(false));
  //   }, [lessonId, sectionId, studentId, unitId]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          Student Work Summary
        </Typography>
        {/* {loading && <CircularProgress size={24} />}
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        {!loading && !error && (
          <Typography variant="body1">{summary || 'No summary available.'}</Typography>
        )} */}
      </CardContent>
    </Card>
  );
};

export default StudentWorkLessonSummary;
