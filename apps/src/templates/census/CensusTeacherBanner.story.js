import React from 'react';

import CensusTeacherBanner from './CensusTeacherBanner';

export default {
  component: CensusTeacherBanner,
};

export const BasicCensus = () => (
  <CensusTeacherBanner
    schoolYear={2024}
    onSubmitSuccess={() => {}}
    onDismiss={() => {}}
    onPostpone={() => {}}
    onTeachesChange={() => {}}
    onInClassChange={() => {}}
    existingSchoolInfo={{
      id: 'ABCD',
      name: 'NCES School',
      country: 'US',
      zip: '12345',
    }}
    question={'how_many_10_hours'}
    teaches={true}
    inClass={true}
    teacherName={'BlakeSmith'}
    teacherEmail={'BlakeSmith@gmail.com'}
  />
);
