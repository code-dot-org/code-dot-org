// The level header's middle for a unit with simple progress: the unit's
// image, then the unit name and the part's label on one line over the
// part's bar and the project's saved-at on the next, with the project's
// buttons after. One flex row, nothing measured: each part shrinks on its
// own and the row centers what is left. HeaderMiddle measures because its
// bubbles need a count that fits; nothing here does. It shows on mount:
// HeaderMiddle's wait for an app load has no signal under Lab2, the only
// place simple progress is used.
//
// What the bar shows comes from the lesson's levels (where the current level
// sits among those sharing its header label) unless the simpleProgress
// store slice carries something: an adaptive pathway reports its own steps.

import {isEqual} from 'lodash';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentLevels} from '@cdo/apps/code-studio/progressReduxSelectors';
import {SimpleProgressState} from '@cdo/apps/code-studio/simpleProgressRedux';

import ProjectInfo from './ProjectInfo';
import ProjectUpdatedAt from './ProjectUpdatedAt';
import remeasureOnFontsReady from './remeasureOnFontsReady';
import SimpleProgress, {ProgressLevel, subPathFor} from './SimpleProgress';

import styles from './simple-header.module.scss';

interface HeaderState {
  isRtl: boolean;
  project?: {showProjectUpdatedAt?: boolean};
  simpleProgress?: {progress: SimpleProgressState | null};
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
  const reported = useSelector(
    (state: HeaderState) => state.simpleProgress?.progress ?? null
  );
  // The selector builds a new array per call; compare by content or every
  // store change re-renders the row.
  const levels = useSelector(getCurrentLevels, isEqual) as
    | ProgressLevel[]
    | undefined;
  const subPath = reported ?? subPathFor(levels);
  const imageUrl = reported?.image ?? scriptData.simpleProgressImage;

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
      {imageUrl && <img src={imageUrl} alt="" className={styles.image} />}
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
          {scriptNameData && subPath && (
            <span className={styles.separator} aria-hidden="true">
              ·
            </span>
          )}
          {subPath && (
            <span id="simple_progress_label" className={styles.label}>
              {subPath.label}
            </span>
          )}
        </div>
        <div className={styles.status}>
          <div id="simple_progress_container" className={styles.progress}>
            <SimpleProgress subPath={subPath} />
          </div>
          {showSaved && (
            <div className={styles.saved}>
              <ProjectUpdatedAt />
            </div>
          )}
        </div>
      </div>
      <div id="project_info_container" className={styles.projectInfo}>
        <ProjectInfo isRtl={isRtl} />
      </div>
    </div>
  );
};

export default SimpleHeader;
