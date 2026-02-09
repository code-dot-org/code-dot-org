import {LinkButton} from '@code-dot-org/component-library/button';
import {
  BodyThreeText,
  BodyTwoText,
  Heading5,
} from '@code-dot-org/component-library/typography';
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
      <Heading5>Add or Edit Rubrics</Heading5>
      <BodyThreeText>
        Rubrics are defined on the lesson. The level the rubric is assigned to
        must be submittable. Below are links to the lessons that this level is a
        part of. You must make this level submittable and save it before you
        will be able to assign a rubric to it. The edit/add links will open in a
        new tab.
      </BodyThreeText>
      {lessons.length === 0 && (
        <BodyTwoText>
          This level is not in any lessons. Assign it to a lesson to add or edit
          the rubric for the lesson.
        </BodyTwoText>
      )}
      <div className={moduleStyles.rubricButtonContainer}>
        {lessons.map(lesson => (
          <div key={lesson.id} className={moduleStyles.rubricRow}>
            {lesson.rubric_id ? (
              <LinkButton
                href={'/rubrics/' + lesson.rubric_id + '/edit'}
                target="_blank"
                text={`Edit Rubric`}
                size={'s'}
              />
            ) : (
              <LinkButton
                href={'/rubrics/new?lessonId=' + lesson.id}
                target="_blank"
                text={`Add Rubric`}
                size={'s'}
              />
            )}
            <BodyTwoText className={moduleStyles.lessonText}>
              <b>Script:</b> {lesson.script_name || 'NONE'}, <b>Lesson:</b>{' '}
              {lesson.name}
            </BodyTwoText>
          </div>
        ))}
      </div>
    </div>
  );
}
