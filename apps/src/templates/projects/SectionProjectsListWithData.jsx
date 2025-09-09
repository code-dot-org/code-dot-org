import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import Spinner from '@cdo/apps/sharedComponents/Spinner';

import SectionProjectsList from './SectionProjectsList';

const SectionProjectsListWithData = ({
  sectionId,
  localeCode,
  studioUrlPrefix,
}) => {
  const [projectsData, setProjectsData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    const projectsDataUrl = `/dashboardapi/v1/projects/section/${sectionId}`;

    $.ajax({
      url: projectsDataUrl,
      method: 'GET',
      dataType: 'json',
    }).done(projectsData => {
      setProjectsData(projectsData);
      setIsLoading(false);
    });
  }, [sectionId, setProjectsData, setIsLoading]);

  return (
    <div>
      {isLoading && <Spinner />}
      {!isLoading && (
        <SectionProjectsList
          localeCode={localeCode}
          projectsData={projectsData}
          studioUrlPrefix={studioUrlPrefix}
          showProjectThumbnails={true}
        />
      )}
    </div>
  );
};

SectionProjectsListWithData.propTypes = {
  studioUrlPrefix: PropTypes.string,

  // Props provided by redux.
  localeCode: PropTypes.string,
  sectionId: PropTypes.number,
};

export const UnconnectedSectionProjectsListWithData =
  SectionProjectsListWithData;

export default connect(state => ({
  localeCode: state.locales.localeCode,
  sectionId: state.teacherSections.selectedSectionId,
}))(SectionProjectsListWithData);
