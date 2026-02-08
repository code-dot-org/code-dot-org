import {z} from 'zod';

export const RubricSchema = z
  .object({
    id: z.number(),
    lesson_id: z.number(),
    level_id: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .transform(data => ({
    id: data.id,
    lessonId: data.lesson_id,
    levelId: data.level_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }));

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
  .transform(data => ({
    name: data.name,
    displayName: data.displayName,
    disablePostMilestone: data.disablePostMilestone,
    studentDetailProgressView: data.student_detail_progress_view,
    age13Required: data.age_13_required,
    showSignInCallout: data.show_sign_in_callout,
    hasUnnumberedLessons: data.hasUnnumberedLessons,
    courseName: data.course_name,
    courseId: data.course_id,
    unitPosition: data.unit_position,
  }));

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
  .transform(data => ({
    id: data.id,
    key: data.key,
    displayName: data.display_name,
    description: data.description,
    bigQuestions: data.big_questions,
    userFacing: data.user_facing,
    position: data.position,
  }));

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
  .transform(data => ({
    src: data.src,
    key: data.key,
    name: data.name,
    download: data.download,
    thumbnail: data.thumbnail,
    enableFallback: data.enable_fallback,
    autoplay: data.autoplay,
  }));

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

const BaseLevelTransform = (
  data: z.infer<typeof BaseLevelDefinitionSchema>,
) => ({
  levelId: data.level_id,
  type: data.type,
  name: data.name,
  displayName: data.display_name,
  isValidated: data.is_validated,
  canHaveFeedback: data.can_have_feedback,
  title: data.title,
  questions: data.questions,
  answers: data.answers,
  shortInstructions: data.short_instructions,
  longInstructions: data.long_instructions,
  markdown: data.markdown,
  teacherMarkdown: data.teacher_markdown,
  reference: data.reference,
  rubricKeyConcept: data.rubric_key_concept,
  rubricPerformanceLevel1: data.rubric_performance_level_1,
  rubricPerformanceLevel2: data.rubric_performance_level_2,
  rubricPerformanceLevel3: data.rubric_performance_level_3,
  rubricPerformanceLevel4: data.rubric_performance_level_4,
  miniRubric: data.mini_rubric,
  videoYoutube: data.video_youtube,
  videoDownload: data.video_download,
});

export const BaseLevelSchema =
  BaseLevelDefinitionSchema.transform(BaseLevelTransform);

export const LevelDefinitionSchema = BaseLevelDefinitionSchema.extend({
  contained_levels: z.array(BaseLevelSchema).optional(),
});

const LevelTransform = (data: z.infer<typeof LevelDefinitionSchema>) => ({
  ...BaseLevelTransform(data),
  containedLevels: data.contained_levels,
});

export const LevelSchema = LevelDefinitionSchema.transform(LevelTransform);

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

export const SublevelSchema = SublevelDefinitionSchema.transform(data => ({
  ...LevelTransform(data),
  id: data.id,
  description: data.description,
  thumbnailUrl: data.thumbnail_url,
  position: data.position,
  letter: data.letter,
  icon: data.icon,
  usesLab2: data.uses_lab2,
  parentLevelId: data.parent_level_id,
  navigationType: data.navigation_type,
  url: data.url,
  path: data.path,
}));

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
  id: parseInt(data.id),
  ids: data.ids.map(id => parseInt(id)),
  activeId: parseInt(data.activeId),
  inactiveIds: data.inactiveIds.map(id => parseInt(id)),
  position: data.position,
  kind: data.kind,
  icon: data.icon,
  isConceptLevel: data.is_concept_level,
  title: data.title,
  url: data.url,
  path: data.path,
  freePlay: data.freePlay,
  bonus: data.bonus,
  displayAsUnplugged: data.display_as_unplugged,
  app: data.app,
  usesLab2: data.uses_lab2,
  isValidated: data.is_validated,
  canHaveFeedback: data.can_have_feedback,
  progressionDisplayName: data.progression_display_name,
  name: data.name,
  sublevels: data.sublevels,
  previous: data.previous,
  next: data.next,
  pageNumber: data.page_number,
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

export const LessonSchema = LessonDefinitionSchema.transform(data => ({
  scriptId: data.script_id,
  scriptName: data.script_name,
  numScriptLessons: data.num_script_lessons,
  id: data.id,
  position: data.position,
  relativePosition: data.relative_position,
  name: data.name,
  key: data.key,
  assessment: data.assessment,
  title: data.title,
  lessonGroupDisplayName: data.lesson_group_display_name,
  lockable: data.lockable,
  hasLessonPlan: data.hasLessonPlan,
  numberedLesson: data.numberedLesson,
  levels: data.levels,
  descriptionStudent: data.description_student,
  descriptionTeacher: data.description_teacher,
  unplugged: data.unplugged,
  lessonEditPath: data.lessonEditPath,
  lessonStartUrl: data.lessonStartUrl,
  duration: data.duration,
  background: data.background,
  rubric: data.rubric,
  lessonFeedbackUrl: data.lesson_feedback_url,
  lessonPlanHtmlUrl: data.lesson_plan_html_url,
  lessonPlanPdfUrl: data.lesson_plan_pdf_url,
  studentLessonPlanHtmlUrl: data.student_lesson_plan_html_url,
  finishLink: data.finishLink,
  finishText: data.finishText,
  lessonExtrasLevelUrl: data.lesson_extras_level_url,
}));

export const LevelKinds = {
  PeerReview: 'peer_review',
  Assessment: 'assessment',
  Puzzle: 'puzzle',
  Unplugged: 'unplugged',
  Level: 'level',
  StageExtras: 'stage_extras',
} as const;
