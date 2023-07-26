import React from 'react';
import style from './rubrics.module.scss';
import {Heading6} from '@cdo/apps/componentLibrary/typography';

export default function RubricContainer() {
  return (
    <div className={style.rubricContainer}>
      <div className={style.rubricHeader}>
        <Heading6>Rubrics</Heading6>
      </div>
      <div className={style.rubricContent}>Rubric Content to Come</div>
    </div>
  );
}
