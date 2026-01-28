import {Typography} from '@mui/material';
import React from 'react';

import {
  CFULevel,
  CFULevelResponseResponse,
  CFUMultipleLevelAnswer,
} from '../../types';

interface CFUMatchAnswerProps {
  level: CFULevel;
  response: CFULevelResponseResponse;
}

const CFUMatchAnswer: React.FC<CFUMatchAnswerProps> = ({level, response}) => {
  const flatAnswers: CFUMultipleLevelAnswer[] = (level.answers ||
    []) as CFUMultipleLevelAnswer[];
  const options: string[] = (level.options || []).map(option =>
    typeof option === 'string' ? option : ''
  );

  const rawStudentResult = response.student_result;

  let studentOrder: number[] | null = null;
  if (Array.isArray(rawStudentResult)) {
    studentOrder = rawStudentResult as number[];
  } else if (
    typeof rawStudentResult === 'string' &&
    rawStudentResult.trim() !== ''
  ) {
    studentOrder = rawStudentResult
      .split(',')
      .map(part => parseInt(part, 10))
      .filter(index => !Number.isNaN(index));
  }

  const hasCompleteStudentOrder =
    studentOrder !== null && studentOrder.length === flatAnswers.length;

  // Status can be 'submitted'/'unsubmitted' or more detailed values like
  // 'correct'/'incorrect'. Cast to string to avoid type mismatch.
  const isCorrect = String(response.status) === 'correct';

  // When the student has submitted an answer, we want to show the pairs
  // the student created. We interpret student_result as an array where
  // each entry is the index of the answer (definition) chosen for the
  // option (term) at the same index.
  const hasStudentMatches =
    hasCompleteStudentOrder && options.length === flatAnswers.length;

  return (
    <div>
      {hasStudentMatches ? (
        <>
          <Typography variant="body3">
            <strong>Student matches</strong>
          </Typography>
          {options.map((optionText, optionIndex) => {
            const answerIndex = studentOrder![optionIndex];
            const answer = flatAnswers[answerIndex];
            return (
              <div key={optionIndex}>
                {/* Left column: option/term */}
                <Typography variant="body4">{optionText}</Typography>
                {/* Right column: definition the student matched */}
                <Typography variant="body4">
                  {answer ? answer.text : 'No match selected'}
                </Typography>
              </div>
            );
          })}
        </>
      ) : (
        <>
          {/* Incomplete state: no student answer; just show all options and answers */}
          <Typography variant="body3">
            <strong>Options</strong>
          </Typography>
          {options.map((optionText, index) => (
            <Typography key={index} variant="body4">
              {optionText}
            </Typography>
          ))}

          <Typography variant="body3">
            <strong>Definitions</strong>
          </Typography>
          {flatAnswers.map((answer, index) => (
            <Typography key={index} variant="body4">
              {answer.text}
            </Typography>
          ))}
        </>
      )}

      {/* Optional overall correctness hint */}
      <Typography variant="overline2">
        Overall status: {isCorrect ? 'correct' : 'not correct'}
      </Typography>
    </div>
  );
};

export default CFUMatchAnswer;
