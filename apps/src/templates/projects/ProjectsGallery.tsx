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

const ProjectsGallery: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  // The projects redux store isn't typed yet. When it is, we can update to useAppSelector.
  const selectedGallery = useSelector(
    (state: {projects: {selectedGallery: string}}) =>
      state.projects.selectedGallery
  );

  const galleries = useMemo(() => {
    const galleries = [
      {
        value: Galleries.PRIVATE,
        label: i18n.myProjects(),
        url: '/projects',
      },
      {
        value: Galleries.LIBRARIES,
        label: i18n.myLibraries(),
        url: '/projects/libraries',
      },
      {
        value: Galleries.PUBLIC,
        label: i18n.featuredProjects(),
        url: '/projects/public',
      },
    ];
    return galleries;
  }, []);

  const handleOnChange = useCallback(
    (value: string) => {
      dispatch(selectGallery(value));
      const gallery = galleries.find(gallery => gallery.value === value);
      if (gallery) {
        window.history.pushState(null, 'null', gallery.url);
      }
    },
    [galleries, dispatch]
  );

  return (
    <div id="uitest-gallery-switcher">
      <SegmentedButtons
        selectedButtonValue={selectedGallery}
        size="l"
        buttons={galleries}
        onChange={value => handleOnChange(value)}
      />
      <div className={moduleStyles.galleryContent}>
        {selectedGallery === Galleries.PRIVATE && <PersonalProjectsTable />}
        {selectedGallery === Galleries.LIBRARIES && <LibraryTable />}
        {selectedGallery === Galleries.PUBLIC && <PublicGallery />}
      </div>
    </div>
  );
};

export default ProjectsGallery;
