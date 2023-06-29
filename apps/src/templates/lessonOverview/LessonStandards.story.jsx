import React from 'react';
import LessonStandards, {ExpandMode} from './LessonStandards';
import {
  cspStandards,
  cstaStandards,
} from '../../../test/unit/templates/lessonOverview/sampleStandardsData.js';

export default {
  title: 'LessonStandards',
  component: LessonStandards,
};

export const WithParentCategory = () => (
  <LessonStandards standards={[cspStandards[0]]} />
);

export const WithoutParentCategory = () => (
  <LessonStandards standards={[cstaStandards[0]]} />
);

export const WithDifferentFrameworks = () => (
  <LessonStandards standards={cspStandards.concat(cstaStandards)} />
);

export const ExpandAll = () => (
  <LessonStandards
    standards={cspStandards.concat(cstaStandards)}
    expandMode={ExpandMode.ALL}
  />
);
