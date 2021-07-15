import PropTypes from 'prop-types';
import React, {useState} from 'react';
import ProjectsList from './ProjectsList';
import StudentFilterDropdown, {ALL_STUDENTS} from './StudentFilterDropdown';

const SectionProjectsList = ({
  projectsData,
  studioUrlPrefix,
  showProjectThumbnails
}) => {
  const [selectedStudent, setSelectedStudent] = useState(ALL_STUDENTS);

  const studentNames = projectsData.map(s => s.studentName).sort();

  const filteredProjectsData = projectsData.filter(project =>
    [ALL_STUDENTS, project['studentName']].includes(selectedStudent)
  );

  return (
    <div>
      <div style={styles.filterRow}>
        <StudentFilterDropdown
          onChangeStudent={selectedStudent =>
            setSelectedStudent(selectedStudent)
          }
          selectedStudent={selectedStudent}
          studentNames={studentNames}
          style={styles.filterComponent}
        />
        <div style={styles.clearDiv} />
      </div>
      <ProjectsList
        projectsData={filteredProjectsData}
        studioUrlPrefix={studioUrlPrefix}
        showProjectThumbnails={showProjectThumbnails}
      />
    </div>
  );
};

SectionProjectsList.propTypes = {
  projectsData: PropTypes.array.isRequired,
  // The prefix for the code studio url in the current environment,
  // e.g. '//studio.code.org' or '//localhost-studio.code.org:3000'.
  studioUrlPrefix: PropTypes.string.isRequired,
  showProjectThumbnails: PropTypes.bool.isRequired
};

const styles = {
  filterComponent: {
    float: 'right'
  },
  filterRow: {
    paddingBottom: 10
  },
  clearDiv: {
    clear: 'both'
  }
};
export default SectionProjectsList;
