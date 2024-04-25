import React from 'react';

import CensusTeacherBanner from './CensusTeacherBanner';

export default {
  component: CensusTeacherBanner,
};

export const BasicCensus = () => (
  <CensusTeacherBanner
    schoolYear={2024}
    onSubmit={() => {}}
    onDismiss={() => {}}
    onPostpone={() => {}}
    onTeachesChange={() => {}}
    onInClassChange={() => {}}
    ncesSchoolId={'-1'}
    question={'how_many_10_hours'}
    teaches={true}
    inClass={true}
    teacherId={1111111}
    teacherName={'BlakeSmith'}
    teacherEmail={'BlakeSmith@gmail.com'}
    showInvalidError={false}
    showUnknownError={false}
    submittedSuccessfully={true}
  />
);
