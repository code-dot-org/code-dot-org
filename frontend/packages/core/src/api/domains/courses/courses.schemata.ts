import {z} from 'zod';
import camelcaseKeys from 'camelcase-keys';

export const ParticipantAudiences = {
  Facilitator: 'facilitator',
  Teacher: 'teacher',
  Student: 'student',
} as const;

export const PublishedStates = {
  InDevelopment: 'in_development',
  Pilot: 'pilot',
  Beta: 'beta',
  Preview: 'preview',
  Stable: 'stable',
  Sunsetting: 'sunsetting',
  Deprecated: 'deprecated',
} as const;

export const InstructionTypes = {
  TeacherLed: 'teacher_led',
  SelfPaced: 'self_paced',
} as const;

export const InstructorAudiences = {
  UniversalInstructor: 'universal_instructor',
  PlcReviewer: 'plc_reviewer',
  Facilitator: 'facilitator',
  Teacher: 'teacher',
} as const;

export const RubricSchema = z
  .object({
    id: z.number(),
    lesson_id: z.number(),
    level_id: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const UnitSummarySchema = z
  .object({
    name: z.string(),
    displayName: z.string(),
    disablePostMilestone: z.boolean(),
    student_detail_progress_view: z.boolean(),
    age_13_required: z.boolean(),
    show_sign_in_callout: z.boolean(),
    hasUnnumberedLessons: z.boolean(),
    course_name: z.string().nullable(),
    course_id: z.string().nullable(),
    unit_position: z.number().nullable(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const LessonSummarySchema = z
  .object({
    id: z.number(),
    key: z.string(),
    display_name: z.string(),
    description: z.string().nullable(),
    big_questions: z.string().nullable(),
    user_facing: z.boolean(),
    position: z.number(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const LessonGroupSummarySchema = z.array(LessonSummarySchema);

export const UnitShortSummarySchema = z.object({
  unitData: UnitSummarySchema,
  lessonGroupData: LessonGroupSummarySchema,
});

export const VideoSchema = z
  .object({
    src: z.string(),
    key: z.string(),
    name: z.string(),
    download: z.string(),
    thumbnail: z.string(),
    enable_fallback: z.boolean(),
    autoplay: z.boolean(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const BaseLevelDefinitionSchema = z.object({
  level_id: z.number(),
  type: z.string(),
  name: z.string().nullable(),
  display_name: z.string().nullable(),
  is_validated: z.boolean(),
  can_have_feedback: z.boolean(),
  title: z.string().nullable(),
  questions: z.array(z.string()).nullable(),
  answers: z.array(z.string()).nullable(),
  short_instructions: z.string().nullable(),
  long_instructions: z.string().nullable(),
  markdown: z.string().nullable(),
  teacher_markdown: z.string().nullable(),
  reference: z.string().nullable(),
  rubric_key_concept: z.string().nullable(),
  rubric_performance_level_1: z.string().nullable(),
  rubric_performance_level_2: z.string().nullable(),
  rubric_performance_level_3: z.string().nullable(),
  rubric_performance_level_4: z.string().nullable(),
  mini_rubric: z.boolean().nullable(),
  video_youtube: z.string().optional(),
  video_download: z.string().optional(),
});

export const BaseLevelSchema = BaseLevelDefinitionSchema.transform(data =>
  camelcaseKeys(data, {deep: true}),
);

export const LevelDefinitionSchema = BaseLevelDefinitionSchema.extend({
  contained_levels: z.array(BaseLevelSchema).optional(),
});

export const LevelSchema = LevelDefinitionSchema.transform(data =>
  camelcaseKeys(data, {deep: true}),
);

export const SublevelDefinitionSchema = LevelDefinitionSchema.extend({
  id: z.number(),
  description: z.string().nullable(),
  thumbnail_url: z.string().nullable(),
  position: z.number(),
  letter: z.string(),
  icon: z.string().nullable(),
  uses_lab2: z.boolean(),
  parent_level_id: z.number(),
  navigation_type: z.string(),
  url: z.string(),
  path: z.string(),
  perfect: z.boolean().optional(),
  status: z.string().optional(),
  teacher_feedback_review_state: z.string().optional(),
  exampleSolutions: z.array(z.string()).optional(),
});

export const SublevelSchema = SublevelDefinitionSchema.transform(data =>
  camelcaseKeys(data, {deep: true}),
);

export const UnitLevelDefinitionSchema = z.object({
  id: z.string(),
  ids: z.array(z.string()),
  activeId: z.string(),
  inactiveIds: z.array(z.string()),
  position: z.number(),
  kind: z.string(),
  icon: z.string(),
  is_concept_level: z.boolean(),
  title: z.number(),
  url: z.string(),
  path: z.string(),
  freePlay: z.boolean(),
  bonus: z.boolean(),
  display_as_unplugged: z.boolean(),
  app: z.string(),
  uses_lab2: z.boolean(),
  is_validated: z.boolean(),
  can_have_feedback: z.boolean(),
  progression_display_name: z.string().optional(),
  name: z.string().optional(),
  sublevels: z.array(SublevelSchema).optional(),
  previous: z.union([z.boolean(), z.array(z.number())]).optional(),
  next: z.union([z.boolean(), z.array(z.number())]).optional(),
  page_number: z.number().optional(),
});

export const UnitLevelSchema = UnitLevelDefinitionSchema.transform(data => ({
  ...camelcaseKeys(data, {deep: true}),
  id: parseInt(data.id),
  activeId: parseInt(data.activeId),
  inactiveIds: data.inactiveIds.map(id => parseInt(id)),
  ids: data.ids.map(id => parseInt(id)),
}));

export const LessonDefinitionSchema = z.object({
  script_id: z.number(),
  script_name: z.string(),
  num_script_lessons: z.number(),
  id: z.number(),
  position: z.number(),
  relative_position: z.number(),
  name: z.string(),
  key: z.string(),
  assessment: z.boolean(),
  title: z.string(),
  lesson_group_display_name: z.string().nullable(),
  lockable: z.boolean(),
  hasLessonPlan: z.boolean(),
  numberedLesson: z.boolean(),
  levels: z.array(UnitLevelSchema),
  description_student: z.string(),
  description_teacher: z.string(),
  unplugged: z.boolean().nullable(),
  lessonEditPath: z.string(),
  lessonStartUrl: z.string(),
  duration: z.number(),
  background: z.string().nullable(),
  rubric: RubricSchema.nullable(),
  lesson_feedback_url: z.string().optional(),
  lesson_plan_html_url: z.string().optional(),
  lesson_plan_pdf_url: z.string().optional(),
  student_lesson_plan_html_url: z.string().optional(),
  finishLink: z.string().optional(),
  finishText: z.string().optional(),
  lesson_extras_level_url: z.string().optional(),
});

export const LessonSchema = LessonDefinitionSchema.transform(data =>
  camelcaseKeys(data, {deep: true}),
);

export const LevelKinds = {
  PeerReview: 'peer_review',
  Assessment: 'assessment',
  Puzzle: 'puzzle',
  Unplugged: 'unplugged',
  Level: 'level',
  StageExtras: 'stage_extras',
} as const;
