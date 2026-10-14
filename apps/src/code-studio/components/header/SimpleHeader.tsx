// The level header's middle for a unit flagged simple_progress: the unit's
// image, the unit name and the current level's header label on one line
// with the project's saved-at under them, and the project's buttons after.
// One flex row, nothing measured. It shows on mount: HeaderMiddle's wait
// for an app load has no signal under Lab2, the only place this is used.

import {isEqual} from 'lodash';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentLevels} from '@cdo/apps/code-studio/progressReduxSelectors';

import ProjectInfo from './ProjectInfo';
import ProjectUpdatedAt from './ProjectUpdatedAt';
import remeasureOnFontsReady from './remeasureOnFontsReady';

import styles from './simple-header.module.scss';

/** A lesson's level as the progress store gives it; only what this reads. */
export interface ProgressLevel {
  headerLabel?: string;
  isCurrentLevel?: boolean;
  sublevels?: {isCurrentLevel?: boolean}[];
}

// The current level's header label; a sublevel's parent is current.
export function currentHeaderLabel(levels?: ProgressLevel[]): string | null {
  const current = levels?.find(
    l => l.isCurrentLevel || l.sublevels?.some(sub => sub.isCurrentLevel)
  );
  return current?.headerLabel || null;
}

interface HeaderState {
  isRtl: boolean;
  project?: {showProjectUpdatedAt?: boolean};
}

interface SimpleHeaderProps {
  scriptData: {simpleProgressImage?: string};
  /** The unit name and its link, as header.build receives them. */
  scriptNameData?: {name: string; href: string; smallText?: boolean};
}

const SimpleHeader: React.FunctionComponent<SimpleHeaderProps> = ({
  scriptData,
  scriptNameData,
}) => {
  const isRtl = useSelector((state: HeaderState) => state.isRtl);
  const showSaved = useSelector(
    (state: HeaderState) => !!state.project?.showProjectUpdatedAt
  );
  // The selector builds a new array per call; compare by content or every
  // store change re-renders the row.
  const levels = useSelector(getCurrentLevels, isEqual) as
    | ProgressLevel[]
    | undefined;
  const label = currentHeaderLabel(levels);

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
          {label && <span className={styles.label}>{label}</span>}
        </div>
        <div className={styles.saved}>{showSaved && <ProjectUpdatedAt />}</div>
      </div>
      <div id="project_info_container" className={styles.projectInfo}>
        <ProjectInfo isRtl={isRtl} />
      </div>
    </div>
  );
};

export default SimpleHeader;
