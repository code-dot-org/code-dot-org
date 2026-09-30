import {
  ClassGalleryProject,
  classGalleryProjectListValidator,
  GallerySort,
  TutorGalleryData,
  unitCountsValidator,
} from '@code-dot-org/lesson-deep-dive';
import React, {FC, ReactNode, useEffect, useState} from 'react';

import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';

import ClassProjectCard from './ClassProjectCard';
import GallerySidebar from './GallerySidebar';

import styles from './challenge-gallery.module.scss';

interface ClassProjectGalleryProps {
  tutorGalleryData: TutorGalleryData;
  // Rendered above the page title; links this view with the challenge
  // gallery.
  viewSwitcher?: ReactNode;
}

// One group per tagged level, in lesson order; the listing's order is kept
// within each group.
const groupByLevel = (projects: ClassGalleryProject[]) => {
  const groups = new Map<number, ClassGalleryProject[]>();
  projects.forEach(project => {
    const group = groups.get(project.script_level_id);
    if (group) {
      group.push(project);
    } else {
      groups.set(project.script_level_id, [project]);
    }
  });
  return [...groups.values()].sort(
    ([a], [b]) =>
      (a.lesson_position ?? 0) - (b.lesson_position ?? 0) ||
      (a.level_position ?? 0) - (b.level_position ?? 0)
  );
};

// Tutor+ class project gallery: the class section's saved work on the
// project levels a unit tags for the gallery, browsable by section and unit,
// one group of cards per tagged level. Shows the signed-in user's own
// projects in the "My projects" view.
const ClassProjectGallery: FC<ClassProjectGalleryProps> = ({
  tutorGalleryData,
  viewSwitcher,
}) => {
  const {units, sections, currentUnitId} = tutorGalleryData;

  const [sectionId, setSectionId] = useState<number | null>(
    sections[0]?.id ?? null
  );
  const [unitId, setUnitId] = useState(currentUnitId);
  const [sort, setSort] = useState<GallerySort>('recent');
  const [projects, setProjects] = useState<ClassGalleryProject[] | null>(null);
  const [unitCounts, setUnitCounts] = useState<Record<string, number>>({});
  const [loadFailed, setLoadFailed] = useState(false);
  const unitIds = units.map(unit => unit.id).join(',');

  useEffect(() => {
    let cancelled = false;
    setProjects(null);
    setLoadFailed(false);
    const params = new URLSearchParams({unit_id: unitId.toString()});
    if (sectionId !== null) {
      params.append('section_id', sectionId.toString());
    }
    if (sort === 'oldest') {
      params.append('sort', 'oldest');
    }
    HttpClient.fetchJson<ClassGalleryProject[]>(
      `/class_gallery_projects?${params.toString()}`,
      {},
      classGalleryProjectListValidator
    )
      .then(({value}) => {
        if (!cancelled) {
          setProjects(value || []);
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
    if (!unitIds) {
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams({unit_ids: unitIds});
    if (sectionId !== null) {
      params.append('section_id', sectionId.toString());
    }
    HttpClient.fetchJson<Record<string, number>>(
      `/class_gallery_projects/unit_counts?${params.toString()}`,
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
  }, [sectionId, unitIds]);

  if (
    !experiments.isEnabledAllowingQueryString(
      experiments.LESSON_TUTOR_CHALLENGE
    )
  ) {
    return null;
  }

  const unitPositionFor = (projectUnitId: number) =>
    units.find(unit => unit.id === projectUnitId)?.position ?? null;

  const sectionName = sections.find(s => s.id === sectionId)?.name ?? null;

  const renderContent = () => {
    if (loadFailed) {
      return (
        <p className={styles.statusText}>
          We couldn&apos;t load the gallery. Try refreshing the page.
        </p>
      );
    }
    if (projects === null) {
      return <p className={styles.statusText}>Loading projects…</p>;
    }
    if (projects.length === 0) {
      return (
        <p className={styles.statusText}>
          No projects have been saved for this unit yet.
        </p>
      );
    }
    return groupByLevel(projects).map(group => (
      <section key={group[0].script_level_id} className={styles.projectGroup}>
        <div className={styles.groupHeader}>
          <h2 className={styles.groupTitle}>
            {group[0].lesson_name ?? `Lesson ${group[0].lesson_position}`}
          </h2>
          <span className={styles.groupCount}>
            {group.length} {group.length === 1 ? 'project' : 'projects'}
          </span>
        </div>
        <div className={styles.classProjectGrid}>
          {group.map(project => (
            <ClassProjectCard
              key={project.channel}
              project={project}
              unitPosition={unitPositionFor(project.unit_id)}
            />
          ))}
        </div>
      </section>
    ));
  };

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
          {viewSwitcher && (
            <div className={styles.viewSwitcher}>{viewSwitcher}</div>
          )}
          <p className={styles.pageOverline}>{sectionName || 'My Projects'}</p>
          <h1 className={styles.pageTitle}>Class Projects</h1>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};

export default ClassProjectGallery;
