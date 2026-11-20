import Alert from '@code-dot-org/component-library/alert';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import i18n from '@cdo/locale';

import SectionProjectsList from './SectionProjectsList';

const SectionProjectsListWithData = ({
  sectionId,
  localeCode,
  studioUrlPrefix,
}) => {
  const [projectsData, setProjectsData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    setLoadFailed(false);
    const projectsDataUrl = `/dashboardapi/v1/projects/section/${sectionId}`;

    $.ajax({
      url: projectsDataUrl,
      method: 'GET',
      dataType: 'json',
    })
      .done(projectsData => {
        setProjectsData(projectsData);
        setIsLoading(false);
      })
      .fail(() => {
        setLoadFailed(true);
        setIsLoading(false);
      });
  }, [sectionId, setProjectsData, setIsLoading]);

  return (
    <div>
      {isLoading && <Spinner />}
      {!isLoading && loadFailed && (
        <Alert type="danger" text={i18n.sectionProjectsLoadError()} />
      )}
      {!isLoading && !loadFailed && (
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
