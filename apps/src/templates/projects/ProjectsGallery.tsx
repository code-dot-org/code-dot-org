import React, {useCallback, useState} from 'react';

import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons';
import LibraryTable from '@cdo/apps/templates/projects/LibraryTable';
import PersonalProjectsTable from '@cdo/apps/templates/projects/PersonalProjectsTable';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';
import i18n from '@cdo/locale';

import {Galleries} from './projectConstants';
import {selectGallery} from './projectsRedux';

import moduleStyles from './project-gallery.module.scss';

interface ProjectsGalleryProps {
  limitedGallery: boolean;
}

const ProjectsGallery: React.FunctionComponent<ProjectsGalleryProps> = ({
  limitedGallery,
}) => {
  const [selectedTab, setSelectedTab] = useState(Galleries.PRIVATE);

  const galleryTabs = [
    {
      value: Galleries.PRIVATE,
      label: i18n.myProjects(),
      url: '/projects',
      tabContent: <PersonalProjectsTable />,
    },
    {
      value: Galleries.LIBRARIES,
      label: i18n.myLibraries(),
      url: '/projects/libraries',
      tabContent: <LibraryTable />,
    },
    {
      value: Galleries.PUBLIC,
      label: i18n.featuredProjects(),
      url: '/projects/public',
      tabContent: <PublicGallery limitedGallery={limitedGallery} />,
    },
  ];

  const handleOnChange = useCallback((value: string) => {
    setSelectedTab(value);
    selectGallery(value);
    const galleryTab = galleryTabs.find(tab => tab.value === value);
    if (galleryTab) {
      window.history.pushState(null, 'null', galleryTab.url);
    }
  }, [galleryTabs]);

  return (
    <div id="uitest-gallery-switcher">
      <SegmentedButtons
        selectedButtonValue={selectedTab}
        size="l"
        buttons={galleryTabs}
        onChange={value => handleOnChange(value)}
      />
      <div className={moduleStyles.galleryContent}>
        {selectedTab === Galleries.PRIVATE && <PersonalProjectsTable />}
        {selectedTab === Galleries.LIBRARIES && <LibraryTable />}
        {selectedTab === Galleries.PUBLIC && (
          <PublicGallery limitedGallery={limitedGallery} />
        )}
      </div>
    </div>
  );
};

export default ProjectsGallery;
