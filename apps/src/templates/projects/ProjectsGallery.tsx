import React, {useCallback, useMemo} from 'react';
import {useSelector} from 'react-redux';

import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons';
import LibraryTable from '@cdo/apps/templates/projects/LibraryTable';
import PersonalProjectsTable from '@cdo/apps/templates/projects/PersonalProjectsTable';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
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
  const dispatch = useAppDispatch();

  const selectedGallery = useSelector(
    (state: {projects: {selectedGallery: string}}) =>
      state.projects.selectedGallery
  );

  const galleryTabs = useMemo(() => {
    const tabs = [
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
    return tabs;
  }, [limitedGallery]);

  const handleOnChange = useCallback(
    (value: string) => {
      dispatch(selectGallery(value));
      const galleryTab = galleryTabs.find(tab => tab.value === value);
      if (galleryTab) {
        window.history.pushState(null, 'null', galleryTab.url);
      }
    },
    [galleryTabs, dispatch]
  );

  return (
    <div id="uitest-gallery-switcher">
      <SegmentedButtons
        selectedButtonValue={selectedGallery}
        size="l"
        buttons={galleryTabs}
        onChange={value => handleOnChange(value)}
      />
      <div className={moduleStyles.galleryContent}>
        {selectedGallery === Galleries.PRIVATE && <PersonalProjectsTable />}
        {selectedGallery === Galleries.LIBRARIES && <LibraryTable />}
        {selectedGallery === Galleries.PUBLIC && (
          <PublicGallery limitedGallery={limitedGallery} />
        )}
      </div>
    </div>
  );
};

export default ProjectsGallery;
