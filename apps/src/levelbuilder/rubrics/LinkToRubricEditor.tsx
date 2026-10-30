import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';

import moduleStyles from './link-to-rubric-editor.module.scss';

interface LinkToRubricEditorProps {
  lessons: {
    id: number;
    name: string;
    rubric_id: number | null;
    script_name: string | null;
  }[];
}

export default function LinkToRubricEditor({lessons}: LinkToRubricEditorProps) {
  return (
    <div className={moduleStyles.linkContainer}>
      <Typography variant="h5" gutterBottom>
        Add or Edit Rubrics
      </Typography>
      <Typography variant="body3" gutterBottom>
        Rubrics are defined on the lesson. The level the rubric is assigned to
        must be submittable. Below are links to the lessons that this level is a
        part of. You must make this level submittable and save it before you
        will be able to assign a rubric to it. The edit/add links will open in a
        new tab.
      </Typography>
      {lessons.length === 0 && (
        <Typography variant="body2" gutterBottom>
          This level is not in any lessons. Assign it to a lesson to add or edit
          the rubric for the lesson.
        </Typography>
      )}
      <div className={moduleStyles.rubricButtonContainer}>
        {lessons.map(lesson => (
          <div key={lesson.id} className={moduleStyles.rubricRow}>
            {lesson.rubric_id ? (
              <MuiButton
                variant="contained"
                color="primary"
                size="small"
                href={'/rubrics/' + lesson.rubric_id + '/edit'}
                target="_blank"
                rel="noopener noreferrer"
              >{`Edit Rubric`}</MuiButton>
            ) : (
              <MuiButton
                variant="contained"
                color="primary"
                size="small"
                href={'/rubrics/new?lessonId=' + lesson.id}
                target="_blank"
                rel="noopener noreferrer"
              >{`Add Rubric`}</MuiButton>
            )}
            <Typography
              className={moduleStyles.lessonText}
              variant="body2"
              gutterBottom
            >
              <b>Script:</b> {lesson.script_name || 'NONE'}, <b>Lesson:</b>{' '}
              {lesson.name}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
}
