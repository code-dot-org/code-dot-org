import {z} from 'zod';

import {WIDGET_ID_PATTERN} from './model.js';
import type {GenericLevelData} from './model.js';

/**
 * Runtime validation for `CurriculumChangeBody` (see model.ts), used at the
 * `/api/changes` boundary. `(await c.req.json()) as CurriculumChangeBody`
 * was a type assertion, not a check: nothing stopped a POST body shaped
 * however an attacker liked from reaching `applyCurriculumChange` and, from
 * there, `SessionStore`'s widget file methods — this is what turned an
 * unchecked `widgetId` into an arbitrary-write primitive. Mirrors the
 * discriminated union in model.ts op for op; the `createWidget` and
 * `updateWidgetMetadata` branches additionally constrain the widget id to
 * `WIDGET_ID_PATTERN`, the same pattern `SessionStore` enforces, so a bad id
 * is rejected here rather than merely being caught downstream.
 */

const OriginSchema = z.enum(['levelbuilder', 'draft']);

const CourseStubSchema = z.object({
  id: z.string().min(1),
  offeringKey: z.string().optional(),
  displayName: z.string().min(1),
  gradeLevels: z.string().optional(),
  origin: OriginSchema,
});

const UnitStubSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  origin: OriginSchema,
  overview: z.string().optional(),
});

const AdaptivePolicySchema = z.object({
  tutorGuidance: z.string().optional(),
  alternatives: z.record(z.string(), z.array(z.string())).optional(),
  allowRepeat: z.boolean().optional(),
});

const LessonStubSchema = z.object({
  id: z.string().min(1),
  lessonKey: z.string().optional(),
  displayName: z.string().min(1),
  origin: OriginSchema,
  goal: z.string().optional(),
  durationMinutes: z.number().int().optional(),
  overview: z.string().optional(),
  outline: z.array(z.string()).optional(),
  expectedOutcome: z.string().optional(),
  adaptivePolicy: AdaptivePolicySchema.optional(),
});

const LessonPatchSchema = z.object({
  displayName: z.string().optional(),
  goal: z.string().optional(),
  durationMinutes: z.number().int().optional(),
  overview: z.string().optional(),
  outline: z.array(z.string()).optional(),
  expectedOutcome: z.string().optional(),
  adaptivePolicy: AdaptivePolicySchema.optional(),
});

const experienceBase = {
  id: z.string().min(1),
  origin: OriginSchema,
  title: z.string().optional(),
};

const ContentExperienceSchema = z.object({
  ...experienceBase,
  kind: z.literal('content'),
  markdown: z.string(),
});

// GenericLevelData is normally a Levelbuilder projection assembled
// server-side by the level importer, never client-authored, but
// insertExperience accepts a whole Experience from the client, so it is
// validated structurally like everything else here rather than trusted.
// levelGroup nests GenericLevelData inside itself (pages of sub-levels), so
// the schema is self-referential via z.lazy.
const AnswerSchema = z.object({text: z.string(), correct: z.boolean()});
const PairSchema = z.object({question: z.string(), answer: z.string()});

const GenericLevelDataSchema: z.ZodType<GenericLevelData> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal('multi'),
      question: z.string(),
      answers: z.array(AnswerSchema),
      allowMultipleAttempts: z.boolean().optional(),
      markdown: z.string().optional(),
    }),
    z.object({
      type: z.literal('match'),
      pairs: z.array(PairSchema),
      markdown: z.string().optional(),
    }),
    z.object({type: z.literal('markdown'), markdown: z.string()}),
    z.object({
      type: z.literal('video'),
      videoKey: z.string(),
      youtubeCode: z.string().optional(),
      displayName: z.string().optional(),
    }),
    z.object({
      type: z.literal('levelGroup'),
      title: z.string().optional(),
      pages: z.array(
        z.object({
          levels: z.array(
            z.object({levelKey: z.string(), data: GenericLevelDataSchema}),
          ),
        }),
      ),
    }),
    z.object({
      type: z.literal('bubbleChoice'),
      displayName: z.string().optional(),
      choices: z.array(
        z.object({
          levelKey: z.string(),
          displayName: z.string().optional(),
          data: GenericLevelDataSchema,
        }),
      ),
    }),
    z.object({
      type: z.literal('opaque'),
      levelType: z.string(),
      properties: z.record(z.string(), z.unknown()).optional(),
    }),
  ]),
);

const InstructionsPatchSchema = z.object({
  shortInstructions: z.string().optional(),
  longInstructions: z.string().optional(),
});

// `null` means "delete this key on merge" — see LevelDefinitionPatch
// (model.ts) for why: capturePreviousDefinition (AuthoringState.ts) records
// null for a field the level never had, and a revert must be able to remove
// that field again rather than write back `''`.
const LevelDefinitionPatchSchema = z.object({
  serialized_maze: z.string().nullable().optional(),
  maze: z.string().nullable().optional(),
  startBlocksXml: z.string().nullable().optional(),
  toolboxBlocksXml: z.string().nullable().optional(),
  solutionBlocksXml: z.string().nullable().optional(),
  startDirection: z.string().nullable().optional(),
  ideal: z.string().nullable().optional(),
});

const ExistingLevelExperienceSchema = z.object({
  ...experienceBase,
  kind: z.literal('existingLevel'),
  levelKey: z.string().min(1),
  levelType: z.string(),
  runtime: z.enum(['labhost', 'generic', 'unsupported']),
  labKey: z.enum(['oceans', 'music', 'maze']).optional(),
  levelNumericId: z.number().optional(),
  data: GenericLevelDataSchema.optional(),
  instructionsOverride: InstructionsPatchSchema.optional(),
});

const WidgetExperienceSchema = z.object({
  ...experienceBase,
  kind: z.literal('widget'),
  widgetId: z.string().regex(WIDGET_ID_PATTERN),
  toolName: z.string(),
  description: z.string().optional(),
  defaultInput: z.record(z.string(), z.unknown()).optional(),
});

const ExperienceSchema = z.discriminatedUnion('kind', [
  ContentExperienceSchema,
  ExistingLevelExperienceSchema,
  WidgetExperienceSchema,
]);

const ContentPatchSchema = z.object({
  title: z.string().optional(),
  markdown: z.string().optional(),
});

const LevelPatchSchema = z.object({
  title: z.string().optional(),
});

const WidgetDescriptorSchema = z.object({
  id: z.string().regex(WIDGET_ID_PATTERN),
  toolName: z.string(),
  title: z.string(),
  description: z.string(),
  inputSchema: z.record(z.string(), z.unknown()),
  resourceUri: z.string(),
  visibility: z.array(z.enum(['model', 'app'])),
  network: z.literal('none'),
  eventTypes: z.array(z.string()).optional(),
});

export const CurriculumChangeBodySchema = z.discriminatedUnion('op', [
  z.object({op: z.literal('createCourse'), course: CourseStubSchema}),
  z.object({op: z.literal('removeCourse'), courseId: z.string().min(1)}),
  z.object({
    op: z.literal('createUnit'),
    courseId: z.string().min(1),
    unit: UnitStubSchema,
    position: z.number().int().optional(),
  }),
  z.object({
    op: z.literal('createLesson'),
    unitId: z.string().min(1),
    lesson: LessonStubSchema,
    position: z.number().int().optional(),
  }),
  z.object({
    op: z.literal('updateUnit'),
    unitId: z.string().min(1),
    patch: UnitStubSchema.partial(),
  }),
  z.object({
    op: z.literal('updateLesson'),
    lessonId: z.string().min(1),
    patch: LessonPatchSchema,
  }),
  z.object({
    op: z.literal('insertExperience'),
    lessonId: z.string().min(1),
    experience: ExperienceSchema,
    position: z.number().int(),
  }),
  z.object({
    op: z.literal('removeExperience'),
    lessonId: z.string().min(1),
    experienceId: z.string().min(1),
  }),
  z.object({
    op: z.literal('moveExperience'),
    lessonId: z.string().min(1),
    experienceId: z.string().min(1),
    toPosition: z.number().int(),
    toLessonId: z.string().optional(),
  }),
  z.object({
    op: z.literal('updateContent'),
    experienceId: z.string().min(1),
    patch: ContentPatchSchema,
  }),
  z.object({
    op: z.literal('attachExistingLevel'),
    lessonId: z.string().min(1),
    levelKey: z.string().min(1),
    position: z.number().int(),
  }),
  z.object({
    op: z.literal('createWidget'),
    descriptor: WidgetDescriptorSchema,
  }),
  z.object({
    op: z.literal('updateWidgetMetadata'),
    widgetId: z.string().regex(WIDGET_ID_PATTERN),
    patch: WidgetDescriptorSchema.partial(),
  }),
  z.object({
    op: z.literal('createLevel'),
    lessonId: z.string().min(1),
    level: ExistingLevelExperienceSchema,
    position: z.number().int(),
  }),
  z.object({
    op: z.literal('updateLevel'),
    experienceId: z.string().min(1),
    patch: LevelPatchSchema,
  }),
  z.object({
    op: z.literal('overrideLevelInstructions'),
    experienceId: z.string().min(1),
    patch: InstructionsPatchSchema,
  }),
  z.object({
    op: z.literal('overrideLevelDefinition'),
    experienceId: z.string().min(1),
    patch: LevelDefinitionPatchSchema,
  }),
]);
