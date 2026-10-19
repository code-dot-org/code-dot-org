// The level header's middle for a unit flagged simple_progress: the unit's
// image, the unit name and the current level's header label on one line
// with the project's saved-at under them, after the project's own controls.
// One flex row, nothing measured, shown on mount.

import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {
  getCurrentLevel,
  getParentLevel,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {ProjectState} from '@cdo/apps/code-studio/projectRedux';

import ProjectInfo from './ProjectInfo';
import ProjectUpdatedAt, {PROJECT_UPDATED_AT_HEIGHT} from './ProjectUpdatedAt';
import remeasureOnFontsReady from './remeasureOnFontsReady';

import styles from './simple-header.module.scss';

// The slices the typed root state leaves out.
interface HeaderState {
  isRtl: boolean;
  project: ProjectState;
}

interface SimpleHeaderProps {
  scriptData: {simpleProgressImage?: string};
  /** The unit name and its link, as header.build receives them. */
  scriptNameData?: {name: string; href: string};
}

const SimpleHeader: React.FunctionComponent<SimpleHeaderProps> = ({
  scriptData,
  scriptNameData,
}) => {
  const isRtl = useSelector((state: HeaderState) => state.isRtl);
  const showSaved = useSelector(
    (state: HeaderState) => state.project.showProjectUpdatedAt
  );
  // A current sublevel's label is its parent's.
  const label: string | undefined = useSelector(
    (state: unknown) =>
      (getParentLevel(state) ?? getCurrentLevel(state))?.headerLabel
  );

  // Eyes UI tests key on these to tell a page with this header from one with
  // a server-rendered header, and to wait for the font swap.
  useEffect(() => {
    document.documentElement.dataset.headerPresent = 'true';
    return remeasureOnFontsReady(() => {
      window.requestAnimationFrame(() => {
        document.documentElement.dataset.headerFontsRelaidOut = 'true';
      });
    });
  }, []);

  return (
    <div id="header_middle_content" className={styles.row}>
      <div id="project_info_container" className={styles.projectInfo}>
        <ProjectInfo isRtl={isRtl} />
      </div>
      {scriptData.simpleProgressImage && (
        <img
          src={scriptData.simpleProgressImage}
          alt=""
          className={styles.image}
        />
      )}
      <div className={styles.text}>
        <div className={styles.title}>
          {scriptNameData && (
            <a
              id="unit_name_container"
              href={scriptNameData.href}
              title={scriptNameData.name}
              className={styles.unitName}
            >
              {scriptNameData.name}
            </a>
          )}
          {scriptNameData && label && (
            <span className={styles.separator} aria-hidden="true">
              ·
            </span>
          )}
          {label && (
            <span className={styles.label} title={label}>
              {label}
            </span>
          )}
        </div>
        {/* The saved-at's height is reserved before it shows, and the line
            height set with it: the header's inherited line height is taller
            and would push the text below the slot. */}
        <div
          className={styles.saved}
          style={{
            height: PROJECT_UPDATED_AT_HEIGHT,
            lineHeight: `${PROJECT_UPDATED_AT_HEIGHT}px`,
          }}
        >
          {showSaved && <ProjectUpdatedAt />}
        </div>
      </div>
    </div>
  );
};

export default SimpleHeader;
