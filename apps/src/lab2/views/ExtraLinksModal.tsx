import React, {useEffect, useState} from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button';
import {Heading3, StrongText} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import * as utils from '@cdo/apps/utils';
import {FeaturedProjectStatus} from '@cdo/generated-scripts/sharedConstants';

import {ExtraLinksLevelData, ExtraLinksProjectData} from '../types';

import moduleStyles from './extra-links.module.scss';

// Extra Links modal. This is used to display helpful links for levelbuilders, and should
// be extended to also include links for project validators as well. It replaces the haml
// version of extra links, which doesn't work on lab2 after a level change.
interface ExtraLinksModalProps {
  levelLinkData: ExtraLinksLevelData;
  projectLinkData?: ExtraLinksProjectData;
  isOpen: boolean;
  closeModal: () => void;
  levelId: number;
}

const ExtraLinksModal: React.FunctionComponent<ExtraLinksModalProps> = ({
  levelLinkData,
  projectLinkData,
  isOpen,
  closeModal,
  levelId,
}) => {
  const [showCloneField, setShowCloneField] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clonedLevelName, setClonedLevelName] = useState('');
  const [cloneError, setCloneError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [featuredProjectStatus, setFeaturedProjectStatus] = useState<
    string | undefined
  >(projectLinkData?.project_info?.featured_status);
  const [abuseScore, setAbuseScore] = useState<number | undefined>(
    projectLinkData?.project_info?.abuse_score
  );

  const channelId: string | undefined = useAppSelector(
    state => state.lab.channel && state.lab.channel.id
  );

  const isStandaloneProject: boolean = useAppSelector(
    state => !!state.lab.levelProperties?.isProjectLevel
  );

  useEffect(() => {
    setClonedLevelName(levelLinkData.level_name);
  }, [levelLinkData]);

  useEffect(() => {
    if (projectLinkData?.project_info) {
      setFeaturedProjectStatus(projectLinkData?.project_info.featured_status);
    }
  }, [projectLinkData]);

  useEffect(() => {
    if (projectLinkData?.project_info?.abuse_score) {
      setAbuseScore(projectLinkData.project_info.abuse_score);
    }
  }, [projectLinkData]);

  const onClose = () => {
    closeModal();
    setShowCloneField(false);
    setShowDeleteConfirm(false);
    setCloneError('');
    setDeleteError('');
  };

  const handleClone = async () => {
    if (clonedLevelName) {
      try {
        const response = await HttpClient.post(
          `/levels/${levelId}/clone?name=${clonedLevelName}`,
          undefined,
          true,
          {contentType: 'application/json;charset=UTF-8'}
        );
        const result = await response.json();
        if (result.redirect) {
          window.location.href = result.redirect;
        }
      } catch (e) {
        if (e instanceof NetworkError) {
          const responseText = await e.response.text();
          setCloneError(responseText);
        } else {
          setCloneError((e as Error).message);
        }
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await HttpClient.delete(`/levels/${levelId}`, true, {
        Accept: 'application/json',
      });
      const result = await response.json();
      if (result.redirect) {
        window.location.href = result.redirect;
      }
    } catch (e) {
      if (e instanceof NetworkError) {
        const responseText = await e.response.text();
        setDeleteError(responseText);
      } else {
        setDeleteError((e as Error).message);
      }
    }
  };

  const onBookmark = async () => {
    try {
      await HttpClient.put(
        `/featured_projects/${channelId}/bookmark`,
        undefined,
        true,
        {contentType: 'application/json;charset=UTF-8'}
      );
      setFeaturedProjectStatus(FeaturedProjectStatus.bookmarked);
    } catch (e) {
      console.log('Error bookmarking project', e);
    }
  };

  const onResetAbuseScore = async () => {
    try {
      await HttpClient.post(
        `/v3/channels/${channelId}/abuse/delete`,
        '',
        true,
        {contentType: 'application/json;charset=UTF-8'}
      );
      setAbuseScore(0);
    } catch (e) {
      // Set abuse score to number < 0 so that error message will be displayed to the admin user.
      setAbuseScore(-1);
    }
  };

  return isOpen ? (
    <AccessibleDialog onClose={onClose}>
      <Heading3>Extra links</Heading3>
      {Object.entries(levelLinkData.links).map(([listTitle, links]) => (
        // Levels can be part of level groups (sublevels) and/or can be a template level
        // so we list these here as well.
        <div key={`${listTitle}-div`}>
          <StrongText key={`${listTitle}-title`}>{listTitle}</StrongText>
          <ul key={`${listTitle}-list`}>
            {links.map(link => (
              <li key={link.url}>
                {link.url ? (
                  // This menu is only used by internal users, who have explicitly requested access keys.
                  // eslint-disable-next-line jsx-a11y/no-access-key
                  <a href={link.url} accessKey={link.access_key}>
                    {link.text}
                  </a>
                ) : (
                  <p>{link.text}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <CloneLevelButton
        canClone={levelLinkData.can_clone}
        isStandaloneProject={isStandaloneProject}
        setShowCloneField={setShowCloneField}
        showCloneField={showCloneField}
        handleClone={handleClone}
        clonedLevelName={clonedLevelName}
        setClonedLevelName={setClonedLevelName}
        cloneError={cloneError}
      />
      <DeleteLevelButton
        canDelete={levelLinkData.can_delete}
        isStandaloneProject={isStandaloneProject}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        handleDelete={handleDelete}
        deleteError={deleteError}
      />
      <ScriptLevelPathLinks
        scriptLevelPathLinks={levelLinkData.script_level_path_links}
      />
      <ProjectLinkData
        isStandaloneProject={isStandaloneProject}
        projectLinkData={projectLinkData}
        featuredProjectStatus={featuredProjectStatus}
        onBookmark={onBookmark}
        onResetAbuseScore={onResetAbuseScore}
        abuseScore={abuseScore}
      />
    </AccessibleDialog>
  ) : null;
};

interface CloneLevelButtonProps {
  canClone: boolean;
  isStandaloneProject: boolean;
  setShowCloneField: (showCloneField: boolean) => void;
  showCloneField: boolean;
  handleClone: () => void;
  clonedLevelName: string;
  setClonedLevelName: (clonedLevelName: string) => void;
  cloneError: string;
}

const CloneLevelButton: React.FunctionComponent<CloneLevelButtonProps> = ({
  canClone,
  isStandaloneProject,
  setShowCloneField,
  showCloneField,
  handleClone,
  clonedLevelName,
  setClonedLevelName,
  cloneError,
}) => {
  if (!canClone || isStandaloneProject) {
    return null;
  }
  return (
    <div>
      <Button
        size="xs"
        onClick={() => setShowCloneField(!showCloneField)}
        text={showCloneField ? 'Cancel Clone' : 'Clone'}
      />
      {showCloneField && (
        <div>
          {'New level name: '}
          <input
            type="text"
            value={clonedLevelName}
            onChange={event => setClonedLevelName(event.target.value)}
          />
          <Button onClick={handleClone} text={'Clone'} size="xs" />
          {cloneError && (
            <p className={moduleStyles.errorMessage}>{cloneError}</p>
          )}
        </div>
      )}
    </div>
  );
};

interface DeleteLevelButtonProps {
  canDelete: boolean;
  isStandaloneProject: boolean;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (showDeleteConfirm: boolean) => void;
  handleDelete: () => void;
  deleteError: string;
}
const DeleteLevelButton: React.FunctionComponent<DeleteLevelButtonProps> = ({
  canDelete,
  isStandaloneProject,
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleDelete,
  deleteError,
}) => {
  if (!canDelete || isStandaloneProject) {
    return null;
  }
  return (
    <div>
      <Button
        size="xs"
        text={showDeleteConfirm ? 'Cancel Delete' : 'Delete'}
        color={buttonColors.destructive}
        onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
        className={moduleStyles.bottomButton}
      />
      {showDeleteConfirm && (
        <div>
          {'Are you sure you want to delete this level? '}
          <Button onClick={handleDelete} text={'Confirm Delete'} size="xs" />
          {deleteError && (
            <p className={moduleStyles.errorMessage}>{deleteError}</p>
          )}
        </div>
      )}
    </div>
  );
};
interface FeaturedProjectStatusProps {
  featuredProjectStatus: string | undefined;
  onBookmark: () => void;
}

const FeaturedProjectInfo: React.FunctionComponent<
  FeaturedProjectStatusProps
> = ({featuredProjectStatus, onBookmark}) => {
  if (featuredProjectStatus === 'n/a') {
    return (
      <>
        <div>Not a featured project</div>
        <Button size="xs" onClick={onBookmark} text={'Bookmark as featured'} />
      </>
    );
  }
  return <div>Featured project status: {featuredProjectStatus}</div>;
};

const RemixAncestry: React.FunctionComponent<{
  remixList: string[];
}> = ({remixList}) => {
  if (remixList.length === 0) {
    return <li>Not a remix.</li>;
  }
  return (
    <>
      {remixList.map((link: string) => (
        <li key={link}>
          <a href={link}>{link}</a>
        </li>
      ))}
    </>
  );
};

const AbuseScoreInfo: React.FunctionComponent<{
  abuseScore: number;
  onResetAbuseScore: () => void;
}> = ({abuseScore, onResetAbuseScore}) => {
  let msg = '';
  if (abuseScore < 0) {
    msg = 'There was an error resetting abuse score to 0. Please try again.';
  } else if (abuseScore < 15) {
    msg = 'Safe to share project.';
  } else {
    msg = 'This project is blocked from sharing';
  }
  const onReportAbuse = async () => {
    utils.navigateToHref('/report_abuse');
  };

  return (
    <>
      Abuse score: {abuseScore >= 0 ? abuseScore : ''}
      <ul>
        <li>{msg}</li>
      </ul>
      <div>
        <Button
          size="xs"
          text={'Reset abuse score to 0'}
          onClick={onResetAbuseScore}
        />
      </div>
      <div>
        <Button
          size="xs"
          text={'Report abuse'}
          onClick={onReportAbuse}
          className={moduleStyles.bottomButton}
        />
      </div>
    </>
  );
};

interface ProjectLinkDataProps {
  projectLinkData?: ExtraLinksProjectData;
  isStandaloneProject: boolean;
  featuredProjectStatus?: string;
  onBookmark: () => void;
  onResetAbuseScore: () => void;
  abuseScore?: number;
}

const ProjectLinkData: React.FunctionComponent<ProjectLinkDataProps> = ({
  projectLinkData,
  isStandaloneProject,
  featuredProjectStatus,
  onBookmark,
  onResetAbuseScore,
  abuseScore,
}) => {
  if (!projectLinkData) {
    return null;
  }
  const ownerInfo = projectLinkData.owner_info;
  const projectInfo = projectLinkData.project_info;
  if (!ownerInfo || !projectInfo) {
    return null;
  }
  return (
    <>
      <StrongText>Project Info</StrongText>
      <ul>
        <li>Project owner: {ownerInfo.name}</li>
        <li>Owner storage id: {ownerInfo.storage_id}</li>
        <li>Project id: {projectInfo.id}</li>
        <li>
          S3 links: <a href={`${projectInfo.sources_link}`}>Sources</a>
        </li>
        {isStandaloneProject && (
          <>
            <li>
              Remix ancestry:
              <ul>
                <RemixAncestry remixList={projectInfo.remix_ancestry} />
              </ul>
            </li>
            <li>Project submitted: {projectInfo.is_published_project}</li>
            <li>
              <FeaturedProjectInfo
                featuredProjectStatus={featuredProjectStatus}
                onBookmark={onBookmark}
              />
            </li>
            {abuseScore !== undefined && (
              <li>
                <AbuseScoreInfo
                  abuseScore={abuseScore}
                  onResetAbuseScore={onResetAbuseScore}
                />
              </li>
            )}
          </>
        )}
      </ul>
    </>
  );
};

interface ScriptLevelPathLinksProps {
  scriptLevelPathLinks?: {
    script: string;
    path: string;
  }[];
}

const ScriptLevelPathLinks: React.FunctionComponent<
  ScriptLevelPathLinksProps
> = ({scriptLevelPathLinks}) => {
  if (!scriptLevelPathLinks) {
    return null;
  }
  return (
    <>
      <StrongText>
        This level is in {Object.entries(scriptLevelPathLinks).length} scripts:
      </StrongText>
      <ul>
        {scriptLevelPathLinks.map(link => (
          <li key={link.path}>
            <a href={'/s/' + link.script}>{link.script}</a> as{' '}
            <a href={link.path}>{link.path}</a>
          </li>
        ))}
      </ul>
    </>
  );
};

export default ExtraLinksModal;
