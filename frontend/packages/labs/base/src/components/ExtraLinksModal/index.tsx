import type {FunctionComponent} from 'react';
import {useEffect, useState} from 'react';

import Button, {buttonColors} from '@code-dot-org/component-library/button';
import Dialog from '@code-dot-org/component-library/dialog';
import {StrongText} from '@code-dot-org/component-library/typography';
import {useCSRF} from '@code-dot-org/user/contexts';

import {FeaturedProjectStatus} from '../../constants';
import {useApp} from '../../contexts';

import type {
  ExtraLinksLevelData,
  ExtraLinksProjectData,
  ParentLevelPathLink,
  ScriptLevelPathLink,
} from '../../types';

import moduleStyles from './extra-links.module.scss';

// Extra Links modal. This is used to display helpful links for levelbuilders, and should
// be extended to also include links for project validators as well. It replaces the haml
// version of extra links, which doesn't work on lab2 after a level change.
export interface ExtraLinksModalProps {
  levelLinkData: ExtraLinksLevelData;
  projectLinkData?: ExtraLinksProjectData;
  isOpen: boolean;
  closeModal: () => void;
  levelId: number;
}

const ExtraLinksModal: FunctionComponent<ExtraLinksModalProps> = ({
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
    projectLinkData?.project_info?.abuse_score,
  );

  const channelId: string | undefined = useApp().lab?.channel?.id;
  const isStandaloneProject: boolean =
    !!useApp().lab?.levelProperties?.isProjectLevel;

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

  const {token} = useCSRF();

  const handleClone = async () => {
    if (clonedLevelName) {
      try {
        const response = await fetch(
          `/levels/${levelId}/clone?name=${clonedLevelName}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
              ...(token
                ? {
                    'X-CSRF-TOKEN': token,
                  }
                : {}),
            },
          },
        );
        if (!response.ok) {
          const responseText = await response.text();
          setCloneError(responseText);
        } else {
          const result = await response.json();
          if (result.redirect) {
            window.location.href = result.redirect;
          }
        }
      } catch (e) {
        setCloneError((e as Error).message);
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/levels/${levelId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          ...(token
            ? {
                'X-CSRF-TOKEN': token,
              }
            : {}),
        },
      });

      if (!response.ok) {
        const responseText = await response.text();
        setDeleteError(responseText);
      } else {
        const result = await response.json();
        if (result.redirect) {
          window.location.href = result.redirect;
        }
      }
    } catch (e) {
      setDeleteError((e as Error).message);
    }
  };

  const onBookmark = async () => {
    try {
      await fetch(`/featured_projects/${channelId}/bookmark`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          ...(token
            ? {
                'X-CSRF-TOKEN': token,
              }
            : {}),
        },
      });
      setFeaturedProjectStatus(FeaturedProjectStatus.bookmarked);
    } catch (e) {
      console.log('Error bookmarking project', e);
    }
  };

  const onResetAbuseScore = async () => {
    try {
      await fetch(`/v3/channels/${channelId}/abuse/delete`, {
        method: 'POST',
        body: '',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          ...(token
            ? {
                'X-CSRF-TOKEN': token,
              }
            : {}),
        },
      });
      setAbuseScore(0);
    } catch (_) {
      // Set abuse score to number < 0 so that error message will be displayed to the admin user.
      setAbuseScore(-1);
    }
  };

  return isOpen ? (
    <Dialog
      onClose={onClose}
      data-theme="Light"
      title="Extra links"
      customContent={
        <>
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
        </>
      }
      primaryButtonProps={{
        text: 'foo',
        style: {display: 'none'},
        onClick: () => {},
      }}
      customBottomContent={
        <>
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
          <ParentLevelPathLinks
            parentLevelPathLinks={levelLinkData.parent_level_path_links}
          />
          <ProjectLinkData
            isStandaloneProject={isStandaloneProject}
            projectLinkData={projectLinkData}
            featuredProjectStatus={featuredProjectStatus}
            onBookmark={onBookmark}
            onResetAbuseScore={onResetAbuseScore}
            abuseScore={abuseScore}
          />
        </>
      }
    />
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

const CloneLevelButton: FunctionComponent<CloneLevelButtonProps> = ({
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
const DeleteLevelButton: FunctionComponent<DeleteLevelButtonProps> = ({
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

const FeaturedProjectInfo: FunctionComponent<FeaturedProjectStatusProps> = ({
  featuredProjectStatus,
  onBookmark,
}) => {
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

const RemixAncestry: FunctionComponent<{
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

const AbuseScoreInfo: FunctionComponent<{
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
    // TODO: use a router/link navigation
    window.location.href = '/report_abuse';
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

const ProjectLinkData: FunctionComponent<ProjectLinkDataProps> = ({
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
  scriptLevelPathLinks?: ScriptLevelPathLink[];
}

const ScriptLevelPathLinks: FunctionComponent<ScriptLevelPathLinksProps> = ({
  scriptLevelPathLinks,
}) => {
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

interface ParentLevelPathLinksProps {
  parentLevelPathLinks?: ParentLevelPathLink[];
}

const ParentLevelPathLinks: FunctionComponent<ParentLevelPathLinksProps> = ({
  parentLevelPathLinks,
}) => {
  if (!parentLevelPathLinks) {
    return null;
  }
  return (
    <>
      <StrongText>
        This level is in {Object.entries(parentLevelPathLinks).length} other
        levels:
      </StrongText>
      <ul>
        {parentLevelPathLinks.map(link => (
          <li key={link.path}>
            {link.kind} in <a href={link.path}>{link.level_name}</a> (position{' '}
            {link.position})
          </li>
        ))}
      </ul>
    </>
  );
};

export default ExtraLinksModal;
