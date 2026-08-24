import React, {FC, useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {
  ChallengeResponse,
  challengeResponseListValidator,
} from '../lessonDeepDive/types';

import GallerySidebar from './GallerySidebar';
import ProjectCard, {ProjectVariant} from './ProjectCard';
import ProjectView from './ProjectView';
import {GallerySort, TutorGalleryData, unitCountsValidator} from './types';

import styles from './challenge-gallery.module.scss';

interface ChallengeGalleryProps {
  tutorGalleryData: TutorGalleryData;
}

const hasVideoAsset = (response: ChallengeResponse) =>
  response.assets.some(asset => asset.asset_type === 'video');

// The selected project is deep-linked via ?project=<id> so project pages
// can be shared and survive a reload.
const projectIdFromLocation = () => {
  const value = new URLSearchParams(window.location.search).get('project');
  const id = value ? parseInt(value, 10) : NaN;
  return isNaN(id) ? null : id;
};

// The Tutor+ project gallery: submitted challenge work, browsable by class
// section and unit, split into video and whiteboard project grids. Shows
// the selected section's work, or the signed-in user's own submissions in
// the "My projects" view. Clicking a project opens its project page in
// place.
const ChallengeGallery: FC<ChallengeGalleryProps> = ({tutorGalleryData}) => {
  const {units, sections, currentUnitId} = tutorGalleryData;

  const [sectionId, setSectionId] = useState<number | null>(
    sections[0]?.id ?? null
  );
  const [unitId, setUnitId] = useState(currentUnitId);
  const [sort, setSort] = useState<GallerySort>('recent');
  const [responses, setResponses] = useState<ChallengeResponse[] | null>(null);
  const [unitCounts, setUnitCounts] = useState<Record<string, number>>({});
  const [loadFailed, setLoadFailed] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(
    projectIdFromLocation
  );

  useEffect(() => {
    const onPopState = () => setProjectId(projectIdFromLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateToProject = (id: number | null) => {
    const params = new URLSearchParams(window.location.search);
    if (id === null) {
      params.delete('project');
    } else {
      params.set('project', id.toString());
    }
    const query = params.toString();
    window.history.pushState(
      null,
      '',
      window.location.pathname + (query ? `?${query}` : '')
    );
    setProjectId(id);
  };

  useEffect(() => {
    let cancelled = false;
    setResponses(null);
    setLoadFailed(false);
    const params = new URLSearchParams({
      unit_id: unitId.toString(),
    });
    if (sectionId !== null) {
      params.append('section_id', sectionId.toString());
    }
    if (sort === 'oldest') {
      params.append('sort', 'oldest');
    }
    HttpClient.fetchJson<ChallengeResponse[]>(
      `/challenge_responses?${params.toString()}`,
      {},
      challengeResponseListValidator
    )
      .then(({value}) => {
        if (!cancelled) {
          setResponses(value || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [sectionId, unitId, sort]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (sectionId !== null) {
      params.append('section_id', sectionId.toString());
    }
    HttpClient.fetchJson<Record<string, number>>(
      `/challenge_responses/unit_counts?${params.toString()}`,
      {},
      unitCountsValidator
    )
      .then(({value}) => {
        if (!cancelled) {
          setUnitCounts(value || {});
        }
      })
      .catch(() => {
        // The sidebar counts are decorative; a failure leaves them at 0.
      });
    return () => {
      cancelled = true;
    };
  }, [sectionId]);

  const unitPositionFor = (responseUnitId: number | null) =>
    units.find(unit => unit.id === responseUnitId)?.position ?? null;

  const sectionName = sections.find(s => s.id === sectionId)?.name ?? null;

  const renderProjectGroup = (
    title: string,
    variant: ProjectVariant,
    groupResponses: ChallengeResponse[]
  ) => (
    <section className={styles.projectGroup}>
      <div className={styles.groupHeader}>
        <h2 className={styles.groupTitle}>{title}</h2>
        <span className={styles.groupCount}>
          {groupResponses.length}{' '}
          {groupResponses.length === 1 ? 'project' : 'projects'}
        </span>
      </div>
      <div
        className={
          variant === 'video' ? styles.videoGrid : styles.whiteboardGrid
        }
      >
        {groupResponses.map(response => (
          <ProjectCard
            key={response.id}
            response={response}
            variant={variant}
            unitPosition={unitPositionFor(response.unit_id)}
            onOpen={() => navigateToProject(response.id)}
          />
        ))}
      </div>
    </section>
  );

  const renderContent = () => {
    if (loadFailed) {
      return (
        <p className={styles.statusText}>
          We couldn&apos;t load the gallery. Try refreshing the page.
        </p>
      );
    }
    if (responses === null) {
      return <p className={styles.statusText}>Loading projects…</p>;
    }
    if (responses.length === 0) {
      return (
        <p className={styles.statusText}>
          No projects have been submitted for this unit yet.
        </p>
      );
    }
    const videoProjects = responses.filter(hasVideoAsset);
    const whiteboardProjects = responses.filter(
      response => !hasVideoAsset(response)
    );
    return (
      <>
        {videoProjects.length > 0 &&
          renderProjectGroup('Video Projects', 'video', videoProjects)}
        {whiteboardProjects.length > 0 &&
          renderProjectGroup(
            'Whiteboard Projects',
            'whiteboard',
            whiteboardProjects
          )}
      </>
    );
  };

  if (projectId !== null) {
    return (
      <div className={styles.page} data-theme="Dark">
        <ProjectView
          responseId={projectId}
          units={units}
          galleryResponses={responses}
          onBack={() => navigateToProject(null)}
          onOpenProject={navigateToProject}
        />
      </div>
    );
  }

  return (
    <div className={styles.page} data-theme="Dark">
      <GallerySidebar
        sections={sections}
        selectedSectionId={sectionId}
        onSectionChange={setSectionId}
        units={units}
        selectedUnitId={unitId}
        onUnitChange={setUnitId}
        unitCounts={unitCounts}
        sort={sort}
        onSortChange={setSort}
      />
      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <p className={styles.pageOverline}>{sectionName || 'My Projects'}</p>
          <h1 className={styles.pageTitle}>Extension Activities</h1>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};

export default ChallengeGallery;
