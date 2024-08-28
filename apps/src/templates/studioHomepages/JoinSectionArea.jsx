import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {Heading2} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import ContentContainer from '../ContentContainer';

import JoinSection from './JoinSection';
import JoinSectionNotifications from './JoinSectionNotifications';
import ParticipantSections from './ParticipantSections';
import shapes from './shapes';

export default function JoinSectionArea({
  initialJoinedPlSections,
  initialJoinedStudentSections,
  isTeacher = false,
  isPlSections = false,
}) {
  const [sectionResults, setSectionResults] = useState({
    action: null,
    result: null,
    resultName: null,
    resultId: null,
    sectionCapacity: null,
    joiningPlSection: false,
  });
  const [joinedPlSections, setJoinedPlSections] = useState(
    initialJoinedPlSections
  );
  const [joinedStudentSections, setJoinedStudentSections] = useState(
    initialJoinedStudentSections
  );
  const updateSectionsResult = (
    action,
    result,
    name,
    id,
    sectionCapacity = null,
    joiningPlSection = false
  ) => {
    setSectionResults({
      action: action,
      result: result,
      resultName: name,
      resultId: id,
      sectionCapacity: sectionCapacity,
      joiningPlSection: joiningPlSection,
    });
  };

  const updateSections = (studentSections, plSections) => {
    setJoinedStudentSections(studentSections);
    setJoinedPlSections(plSections);
  };

  const renderSectionContent = () => {
    return (
      <>
        <JoinSectionNotifications
          action={sectionResults.action}
          result={sectionResults.result}
          name={sectionResults.resultName}
          id={sectionResults.resultId}
          sectionCapacity={sectionResults.sectionCapacity}
          showingPlSections={isPlSections}
          joiningPlSection={sectionResults.joiningPlSection}
        />
        <JoinSection
          enrolledInASection={true}
          updateSections={updateSections}
          updateSectionsResult={updateSectionsResult}
          isTeacher={isTeacher}
        />
        {!isPlSections && joinedStudentSections?.length > 0 && (
          <ParticipantSections
            sections={joinedStudentSections}
            isTeacher={isTeacher}
            updateSectionsResult={updateSectionsResult}
            updateSections={setJoinedStudentSections}
          />
        )}
        {isPlSections && joinedPlSections?.length > 0 && isTeacher && (
          <ParticipantSections
            sections={joinedPlSections}
            isTeacher={isTeacher}
            isPlSections={true}
            updateSectionsResult={updateSectionsResult}
            updateSections={setJoinedPlSections}
          />
        )}
      </>
    );
  };

  return isPlSections ? (
    <>
      <Heading2>
        {i18n.joinedProfessionalLearningSectionsHomepageTitle()}
      </Heading2>
      {renderSectionContent()}
    </>
  ) : (
    <ContentContainer heading={i18n.joinASection()}>
      {renderSectionContent()}
    </ContentContainer>
  );
}

JoinSectionArea.propTypes = {
  initialJoinedStudentSections: shapes.sections,
  initialJoinedPlSections: shapes.sections,
  isTeacher: PropTypes.bool,
  isPlSections: PropTypes.bool,
};
