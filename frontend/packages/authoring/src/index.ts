// Public API for @code-dot-org/authoring. Pure TypeScript: no React, no DOM.
// Node-only pieces (loadCourse, which touches node:fs) live behind the
// separate `@code-dot-org/authoring/node` entry point — see src/node/index.ts.

export {applyChange, type AuthoringState} from './model/apply';
export type {
  ContentPatch,
  CourseStub,
  CurriculumChange,
  LessonPatch,
  LessonStub,
  UnitStub,
} from './model/changes';
export type {
  AdaptivePolicy,
  ContentExperience,
  CourseModel,
  Experience,
  ExistingLevelExperience,
  GenericLevelData,
  Lesson,
  Origin,
  Unit,
  WidgetExperience,
} from './model/types';
export type {WidgetDescriptor} from './model/widget';

export {
  buildCourse,
  type BuildCourseInputs,
  type BuildCourseResult,
  buildFishLevelProperties,
  buildMazeLevelProperties,
  buildMusicLevelProperties,
  type DslExt,
  type LevelPropertiesBlocksSource,
  type LevelSource,
  type ParsedDslLevel,
  parseDslLevel,
  type ParsedLevelXml,
  parseLevelXml,
  type ParsedScriptJson,
  type ParsedScriptLesson,
  type ParsedScriptLevel,
  parseScriptJson,
} from './importer';
export {
  type LevelFileBlocksPatch,
  type LevelFilePatch,
  type LevelFilePropertiesPatch,
  patchLevelFile,
  serializeLevelXml,
} from './writeback/levelFile';
