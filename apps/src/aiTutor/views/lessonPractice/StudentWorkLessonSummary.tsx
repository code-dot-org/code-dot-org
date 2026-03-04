import {CircularProgress, Typography} from '@mui/material';
import React, {FC, useEffect, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
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

  const userId = useAppSelector(state => state.currentUser.userId);

  useEffect(() => {
    const params = new URLSearchParams({
      lesson_id: lessonId.toString(),
      unit_id: unitId.toString(),
      student_id: userId.toString(),
    });

    setLoading(true);
    setError(null);

    HttpClient.fetchJson<InsightResponse>(
      `/student_snapshots/ai_generated_lesson_feedback?${params}`
    )
      .then(response => {
        const jsonString = response?.value?.json || '';
        console.log(jsonString || 'No summary available.');
        setSummary(jsonString || 'No summary available.');
      })
      .catch(err => {
        console.error('Error fetching student work lesson summary', err);
        setError('Unable to load lesson summary.');
      })
      .finally(() => setLoading(false));
  }, [lessonId, unitId, userId]);

  return (
    <>
      {loading && <CircularProgress size={24} />}
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      {!loading && !error && (
        <ChatMessage
          text={summary}
          role={Role.ASSISTANT}
          isAiTutorVersion={true}
        />
      )}
    </>
  );
};

export default StudentWorkLessonSummary;
