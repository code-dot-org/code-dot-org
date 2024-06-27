'use client';
import React from 'react';

import SectionsSetUpContainer from '../../../../../../src/templates/sectionsRefresh/SectionsSetUpContainer';

interface SectionProps {
  section: any;
}
export default function Section({section}: SectionProps) {
  return (
    <SectionsSetUpContainer
      sectionToBeEdited={section}
      canEnableAITutor={false}
    />
  );
}
