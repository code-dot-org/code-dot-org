import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {beforeAll, describe, expect, it} from 'vitest';

import type {BuildCourseResult} from '../../importer/buildCourse';
import type {
  Experience,
  ExistingLevelExperience,
  Lesson,
} from '../../model/types';
import {loadCourse} from '../loadCourse';

// Walk up from this test file looking for dashboard/config — the signature
// of the repo root — rather than assuming a fixed number of `..` hops,
// which would be brittle to worktree layout. Skip gracefully if this
// package is ever exercised outside the monorepo checkout.
function findRepoRoot(startDir: string): string | undefined {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    if (existsSync(path.join(dir, 'dashboard', 'config'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
  return undefined;
}

const repoRoot = findRepoRoot(path.dirname(fileURLToPath(import.meta.url)));

function findLesson(result: BuildCourseResult, lessonKey: string): Lesson {
  const lesson = result.course.units[0].lessons.find(
    l => l.lessonKey === lessonKey,
  );
  if (!lesson) throw new Error(`fixture lesson not found: ${lessonKey}`);
  return lesson;
}

function asExistingLevel(experience: Experience): ExistingLevelExperience {
  if (experience.kind !== 'existingLevel') {
    throw new Error(
      `expected an existingLevel experience, got kind '${experience.kind}'`,
    );
  }
  return experience;
}

if (repoRoot === undefined) {
  describe.skip('loadCourse (real k5-ai-data-2024 curriculum)', () => {
    it('skipped: dashboard/config not found from this checkout', () => {});
  });
} else {
  describe('loadCourse (real k5-ai-data-2024 curriculum)', () => {
    let result: BuildCourseResult;

    beforeAll(() => {
      result = loadCourse(repoRoot, 'k5-ai-data-2024');
    });

    it('preserves course and offering identity', () => {
      expect(result.course.id).toBe('k5-ai-data-2024');
      expect(result.course.offeringKey).toBe('k5-ai-data');
      expect(result.course.units).toHaveLength(1);
      expect(result.course.units[0].lessons).toHaveLength(5);
    });

    it('includes the real lesson keys', () => {
      const lessonKeys = result.course.units[0].lessons.map(l => l.lessonKey);
      expect(lessonKeys).toContain('Training AI');
    });

    it('every imported experience id is lb:-prefixed with levelbuilder origin', () => {
      for (const lesson of result.course.units[0].lessons) {
        for (const experience of lesson.experiences) {
          expect(experience.id.startsWith('lb:')).toBe(true);
          expect(experience.origin).toBe('levelbuilder');
        }
      }
    });

    it("builds the 'Training AI' lesson's 5 experiences: a video then 4 Oceans labhost levels", () => {
      const lesson = findLesson(result, 'Training AI');
      expect(lesson.experiences).toHaveLength(5);

      const [video, fishVTrash, creaturesDemo, creaturesVTrash, long] =
        lesson.experiences.map(asExistingLevel);

      expect(video.runtime).toBe('generic');
      expect(video.levelKey).toBe(
        'Oceans_Video_Elementary_Machine_Learning_2024',
      );
      expect(video.data).toMatchObject({type: 'video'});

      const oceansLevels = [
        [fishVTrash, 'Oceans_FishVTrash_2024'],
        [creaturesDemo, 'Oceans_CreaturesVTrashDemo_2024'],
        [creaturesVTrash, 'Oceans_CreaturesVTrash_2024'],
        [long, 'Oceans_Long_2024'],
      ] as const;

      for (const [experience, levelKey] of oceansLevels) {
        expect(experience.levelKey).toBe(levelKey);
        expect(experience.runtime).toBe('labhost');
        expect(experience.labKey).toBe('oceans');
        expect(experience.levelNumericId).toBeTypeOf('number');

        const properties =
          result.levelProperties[String(experience.levelNumericId)];
        expect(properties).toBeDefined();
        expect(properties.appName).toBe('fish');
        expect(properties.appMode).toBeTruthy();
      }
    });

    it("builds the survey lesson's level group with inlined multi sub-level data", () => {
      const lesson = findLesson(result, 'Using AI Tools in School');
      const survey = asExistingLevel(lesson.experiences[0]);
      expect(survey.levelKey).toBe('k5_ai_data_survey_level');
      expect(survey.levelType).toBe('LevelGroup');
      expect(survey.runtime).toBe('generic');
      if (survey.data?.type !== 'levelGroup') {
        throw new Error('expected levelGroup data');
      }

      expect(survey.data.pages.length).toBeGreaterThan(0);
      const firstSubLevel = survey.data.pages[0].levels[0];
      expect(firstSubLevel.data.type).toBe('multi');
      if (firstSubLevel.data.type !== 'multi')
        throw new Error('expected multi');
      expect(firstSubLevel.data.question.length).toBeGreaterThan(0);
    });

    it('records an unsupported level type (Dancelab) as opaque', () => {
      // The k5-ai-data-2024 curriculum's one "prototype does not have a
      // renderer for this" level is Dancelab (dance_ai_customize_effect_2024),
      // not GamelabJr — same runtime-mapping path either way: any XML root
      // tag other than Fish/Music/StandaloneVideo falls through to
      // unsupported/opaque.
      const lesson = findLesson(result, 'How AI Makes Decisions');
      const dance = lesson.experiences
        .map(asExistingLevel)
        .find(e => e.levelKey === 'dance_ai_customize_effect_2024');
      expect(dance).toBeDefined();
      expect(dance?.runtime).toBe('unsupported');
      expect(dance?.data).toMatchObject({
        type: 'opaque',
        levelType: 'Dancelab',
      });
    });
  });
}
