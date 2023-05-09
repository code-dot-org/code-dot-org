import PropTypes from 'prop-types';
import React, {useState} from 'react';
import JoinSectionNotifications from './JoinSectionNotifications';
import JoinSection from './JoinSection';
import ParticipantSections from './ParticipantSections';
import shapes from './shapes';
import ContentContainer from '../ContentContainer';
import i18n from '@cdo/locale';

export default function JoinSectionArea({
  initialJoinedPlSections,
  initialJoinedStudentSections,
  isTeacher = false,
}) {
  const [sectionResults, setSectionResults] = useState({
    action: null,
    result: null,
    resultName: null,
    resultId: null,
    sectionCapacity: null,
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
    sectionCapacity = null
  ) => {
    setSectionResults({
      action: action,
      result: result,
      resultName: name,
      resultId: id,
      sectionCapacity: sectionCapacity,
    });
  };

  const updateSections = (studentSections, plSections) => {
    setJoinedStudentSections(studentSections);
    setJoinedPlSections(plSections);
  };

  const heading = i18n.joinASection();

  return (
    <ContentContainer heading={heading}>
      <JoinSectionNotifications
        action={sectionResults.action}
        result={sectionResults.result}
        name={sectionResults.resultName}
        id={sectionResults.resultId}
        sectionCapacity={sectionResults.sectionCapacity}
      />
      <JoinSection
        enrolledInASection={true}
        updateSections={updateSections}
        updateSectionsResult={updateSectionsResult}
        isTeacher={isTeacher}
      />
      {joinedStudentSections?.length > 0 && (
        <ParticipantSections
          sections={joinedStudentSections}
          isTeacher={isTeacher}
          updateSectionsResult={updateSectionsResult}
          updateSections={setJoinedStudentSections}
        />
      )}
      {joinedPlSections?.length > 0 && isTeacher && (
        <ParticipantSections
          sections={joinedPlSections}
          isTeacher={isTeacher}
          isPlSections={true}
          updateSectionsResult={updateSectionsResult}
          updateSections={setJoinedPlSections}
        />
      )}
    </ContentContainer>
  );
}

JoinSectionArea.propTypes = {
  initialJoinedStudentSections: shapes.sections,
  initialJoinedPlSections: shapes.sections,
  isTeacher: PropTypes.bool,
};
