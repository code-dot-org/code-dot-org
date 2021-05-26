# == Schema Information
#
# Table name: stages
#
#  id                :integer          not null, primary key
#  name              :string(255)      not null
#  absolute_position :integer
#  script_id         :integer          not null
#  created_at        :datetime
#  updated_at        :datetime
#  lockable          :boolean          default(FALSE), not null
#  relative_position :integer          not null
#  properties        :text(65535)
#  lesson_group_id   :integer
#  key               :string(255)      not null
#  has_lesson_plan   :boolean          not null
#
# Indexes
#
#  index_stages_on_lesson_group_id_and_key  (lesson_group_id,key) UNIQUE
#  index_stages_on_script_id_and_key        (script_id,key) UNIQUE
#

require 'cdo/shared_constants'

# Ordered partitioning of script levels within a script
# (Intended to replace most of the functionality in Game, due to the need for multiple app types within a single Lesson)
class Lesson < ApplicationRecord
  include LevelsHelper
  include SharedConstants
  include Rails.application.routes.url_helpers
  include SerializedProperties

  belongs_to :script, inverse_of: :lessons
  belongs_to :lesson_group
  has_many :lesson_activities, -> {order(:position)}, dependent: :destroy
  has_many :script_levels, -> {order(:chapter)}, foreign_key: 'stage_id', dependent: :destroy
  has_many :levels, through: :script_levels
  has_and_belongs_to_many :resources, join_table: :lessons_resources
  has_and_belongs_to_many :vocabularies, join_table: :lessons_vocabularies
  has_and_belongs_to_many :programming_expressions, join_table: :lessons_programming_expressions
  has_many :objectives, dependent: :destroy

  # join tables needed for seeding logic
  has_many :lessons_resources
  has_many :lessons_vocabularies
  has_many :lessons_programming_expressions

  has_one :plc_learning_module, class_name: 'Plc::LearningModule', inverse_of: :lesson, foreign_key: 'stage_id', dependent: :destroy
  has_and_belongs_to_many :standards, foreign_key: 'stage_id'
  has_many :lessons_standards, foreign_key: 'stage_id' # join table. we need this association for seeding logic

  # the dependent: :destroy clause is needed to ensure that the associated join
  # models are deleted when this lesson is deleted. in order for this to work,
  # the join model must have an :id column.
  has_many :lessons_opportunity_standards,  dependent: :destroy
  has_many :opportunity_standards, through: :lessons_opportunity_standards, source: :standard

  self.table_name = 'stages'

  serialized_attrs %w(
    overview
    student_overview
    unplugged
    creative_commons_license
    assessment
    purpose
    preparation
    announcements
    visible_after
    assessment_opportunities
  )

  # A lesson has an absolute position and a relative position. The difference between the two is that relative_position
  # numbers the lessons in order in two groups 1. lessons that are numbered on the script overview page (lockable false OR has_lesson_plan true)
  # 2. lessons that are not numbered on the script overview page (lockable true AND has_lesson_plan false)
  # if we have two lessons without lesson plans that are lockable followed by a
  # lesson that is not lockable, the third lesson will have an absolute_position of 3 but a relative_position of 1
  acts_as_list scope: :script, column: :absolute_position

  validates_uniqueness_of :key, scope: :script_id

  include CodespanOnlyMarkdownHelper

  def self.add_lessons(script, lesson_group, raw_lessons, counters, new_suffix, editor_experiment)
    script.lessons.reload
    raw_lessons.map do |raw_lesson|
      Lesson.prevent_blank_display_name(raw_lesson)
      Lesson.prevent_changing_stable_i18n_key(script, raw_lesson)

      lesson = script.lessons.detect {|l| l.key == raw_lesson[:key]} ||
        Lesson.find_or_create_by(
          key: raw_lesson[:key],
          script: script
        ) do |l|
          l.name = "" # will be updated below, but cant be null
          l.relative_position = 0 # will be updated below, but cant be null
          l.has_lesson_plan = true # will be reset below if specified
        end

      numbered_lesson = !!raw_lesson[:has_lesson_plan] || !raw_lesson[:lockable]

      lesson.assign_attributes(
        name: raw_lesson[:name],
        absolute_position: (counters.lesson_position += 1),
        lesson_group: lesson_group,
        lockable: !!raw_lesson[:lockable],
        has_lesson_plan: !!raw_lesson[:has_lesson_plan],
        visible_after: raw_lesson[:visible_after],
        unplugged: !!raw_lesson[:unplugged],
        relative_position: numbered_lesson ? (counters.numbered_lesson_count += 1) : (counters.unnumbered_lesson_count += 1)
      )
      lesson.save! if lesson.changed?

      lesson.script_levels = ScriptLevel.add_script_levels(
        script, lesson_group, lesson, raw_lesson[:script_levels], counters, new_suffix, editor_experiment
      )
      lesson.save!
      lesson.reload

      Lesson.prevent_multi_page_assessment_outside_final_level(lesson)

      lesson
    end
  end

  def self.prevent_changing_stable_i18n_key(script, raw_lesson)
    if script.is_stable && ScriptConstants.i18n?(script.name) && I18n.t("data.script.name.#{script.name}.lessons.#{raw_lesson[:key]}").include?('translation missing:')

      raise "Adding new keys or update existing keys for lessons in scripts that are marked as stable and included in the i18n sync is not allowed. Offending Lesson Key: #{raw_lesson[:key]}"
    end
  end

  def self.prevent_blank_display_name(raw_lesson)
    if raw_lesson[:name].blank?
      raise "Expect all lessons to have display names. The following lesson does not have a display name: #{raw_lesson[:key]}"
    end
  end

  # Go through all the script levels for this lesson, except the last one,
  # and raise an exception if any of them are a multi-page assessment.
  # (That's when the script level is marked assessment, and the level itself
  # has a pages property and more than one page in that array.)
  # This is because only the final level in a lesson can be a multi-page
  # assessment.
  def self.prevent_multi_page_assessment_outside_final_level(lesson)
    lesson.script_levels.each do |script_level|
      if lesson.script_levels.last != script_level && script_level.long_assessment?
        raise "Only the final level in a lesson may be a multi-page assessment.  Lesson: #{lesson.name}"
      end
    end

    if lesson.lockable && !lesson.script_levels.last.assessment?
      raise "Expect lockable lessons to have an assessment as their last level. Lesson: #{lesson.name}"
    end
  end

  def script
    return Script.get_from_cache(script_id) if Script.should_cache?
    super
  end

  def to_param
    relative_position.to_s
  end

  def unplugged_lesson?
    script_levels = script.script_levels.select {|sl| sl.stage_id == id}
    return false unless script_levels.first
    script_levels.first.oldest_active_level.unplugged?
  end

  def spelling_bee?
    script_levels = script.script_levels.select {|sl| sl.stage_id == id}
    return false unless script_levels.first
    script_levels.first.oldest_active_level.spelling_bee?
  end

  # We number lessons that either have lesson plans or are not lockable
  def numbered_lesson?
    !!has_lesson_plan || !lockable
  end

  def has_lesson_pdf?
    return false if ScriptConstants.script_in_category?(:csf, script.name) || ScriptConstants.script_in_category?(:csf_2018, script.name)

    !!has_lesson_plan
  end

  def localized_title
    # The standard case for localized_title is something like "Lesson 1: Maze".
    # In the case of lockable lessons without lesson plans, we don't want to include the Lesson 1
    return localized_name unless numbered_lesson?

    if script.lessons.to_a.many?
      I18n.t('stage_number', number: relative_position) + ': ' + localized_name
    else # script only has one lesson, use the script name
      script.title_for_display
    end
  end

  def localized_name
    if script.lessons.many?
      I18n.t "data.script.name.#{script.name}.lessons.#{key}.name"
    else
      I18n.t "data.script.name.#{script.name}.title"
    end
  end

  def localized_lesson_plan
    return script_lesson_path(script, self) if script.is_migrated

    if script.curriculum_path?
      path = script.curriculum_path.gsub('{LESSON}', relative_position.to_s)

      if path.include? '{LOCALE}'
        CDO.curriculum_url I18n.locale, path.split('{LOCALE}/').last
      else
        path
      end
    end
  end

  def lesson_plan_html_url
    localized_lesson_plan || "#{lesson_plan_base_url}/Teacher"
  end

  def lesson_plan_pdf_url
    if script.is_migrated && has_lesson_plan
      Services::CurriculumPdfs.get_lesson_plan_url(self)
    else
      "#{lesson_plan_base_url}/Teacher.pdf"
    end
  end

  def student_lesson_plan_pdf_url
    if script.is_migrated && script.include_student_lesson_plans && has_lesson_plan
      Services::CurriculumPdfs.get_lesson_plan_url(self, true)
    end
  end

  def script_resource_pdf_url
    if script.is_migrated?
      Services::CurriculumPdfs.get_script_resources_url(script)
    end
  end

  def lesson_plan_base_url
    CDO.code_org_url "/curriculum/#{script.name}/#{relative_position}"
  end

  def course_version_standards_url
    script.get_course_version&.all_standards_url
  end

  def summarize(include_bonus_levels = false, for_edit: false)
    lesson_summary = Rails.cache.fetch("#{cache_key}/lesson_summary/#{I18n.locale}/#{include_bonus_levels}") do
      cached_levels = include_bonus_levels ? cached_script_levels : cached_script_levels.reject(&:bonus)

      description_student = I18n.t('description_student', scope: [:data, :script, :name, script.name, :lessons, key], smart: true, default: '')
      description_student = render_codespan_only_markdown(description_student) unless script.is_migrated?
      description_teacher = I18n.t('description_teacher', scope: [:data, :script, :name, script.name, :lessons, key], smart: true, default: '')
      description_teacher = render_codespan_only_markdown(description_teacher) unless script.is_migrated?

      lesson_data = {
        script_id: script.id,
        script_name: script.name,
        num_script_lessons: script.lessons.to_a.size,
        id: id,
        position: absolute_position,
        relative_position: relative_position,
        name: localized_name,
        key: key,
        assessment: !!assessment,
        title: localized_title,
        lesson_group_display_name: lesson_group&.localized_display_name,
        lockable: !!lockable,
        hasLessonPlan: has_lesson_plan,
        numberedLesson: numbered_lesson?,
        levels: cached_levels.map {|sl| sl.summarize(false, for_edit: for_edit)},
        description_student: description_student,
        description_teacher: description_teacher,
        unplugged: unplugged,
        lessonEditPath: edit_lesson_path(id: id)
      }
      # Use to_a here so that we get access to the cached script_levels.
      # Without it, script_levels.last goes back to the database.
      last_script_level = script_levels.to_a.last

      # The last level in a lesson might be a long assessment, so add extra information
      # related to that.  This might include information for additional pages if it
      # happens to be a multi-page long assessment.
      if last_script_level&.long_assessment?
        last_level_summary = lesson_data[:levels].last
        extra_levels = ScriptLevel.summarize_extra_puzzle_pages(last_level_summary)
        lesson_data[:levels] += extra_levels
        last_level_summary[:uid] = "#{last_level_summary[:ids].first}_0"
        last_level_summary[:url] << "/page/1"
        last_level_summary[:page_number] = 1
      end

      if has_lesson_plan
        lesson_data[:lesson_plan_html_url] = lesson_plan_html_url
        lesson_data[:lesson_plan_pdf_url] = lesson_plan_pdf_url
        if script.include_student_lesson_plans && script.is_migrated
          lesson_data[:student_lesson_plan_html_url] = script_lesson_student_path(script, self)
        end
      end

      if script.hoc?
        lesson_data[:finishLink] = script.hoc_finish_url
        lesson_data[:finishText] = I18n.t('nav.header.finished_hoc')
      end

      lesson_data[:lesson_extras_level_url] = script_lesson_extras_url(script.name, lesson_position: relative_position) unless unplugged_lesson?

      lesson_data
    end
    lesson_summary.freeze
  end

  def summarize_for_calendar
    {
      id: id,
      lessonNumber: relative_position,
      title: localized_title,
      duration: lesson_activities.map(&:summarize).sum {|activity| activity[:duration] || 0},
      assessment: !!assessment,
      unplugged: unplugged,
      url: script_lesson_path(script, self)
    }
  end

  # Provides data about this lesson needed by the script edit page.
  #
  # TODO: [PLAT-369] trim down to only include those fields needed on the
  # script edit page
  def summarize_for_script_edit
    summary = summarize(true, for_edit: true).dup
    # Do not let script name override lesson name when there is only one lesson
    summary[:name] = name
    summary[:lesson_group_display_name] = lesson_group&.display_name
    summary.freeze
  end

  # Provides all the editable data related to this lesson and its activities for
  # display on the lesson edit page, excluding any lesson attributes which can
  # be edited on the script edit page (e.g. name and key).
  #
  # The only non-editable data included are the ids of activities and activity
  # sections, which are needed to identify those objects but cannot themselves
  # be edited.
  #
  # Key names are converted to camelCase here so they can easily be consumed by
  # the client.
  def summarize_for_lesson_edit
    lesson_standards = standards.sort_by {|s| [s.framework.name, s.shortcode]}
    {
      id: id,
      name: name,
      overview: overview,
      studentOverview: student_overview,
      assessmentOpportunities: assessment_opportunities,
      assessment: assessment,
      unplugged: unplugged,
      lockable: lockable,
      hasLessonPlan: has_lesson_plan,
      creativeCommonsLicense: creative_commons_license,
      purpose: purpose,
      preparation: preparation,
      announcements: announcements,
      activities: lesson_activities.map(&:summarize_for_lesson_edit),
      resources: resources.map(&:summarize_for_lesson_edit),
      vocabularies: vocabularies.map(&:summarize_for_lesson_edit),
      programmingEnvironments: ProgrammingEnvironment.all.map(&:summarize_for_lesson_edit),
      programmingExpressions: programming_expressions.map(&:summarize_for_lesson_edit),
      objectives: objectives.map(&:summarize_for_edit),
      standards: lesson_standards.map(&:summarize_for_lesson_edit),
      frameworks: Framework.all.map(&:summarize_for_lesson_edit),
      opportunityStandards: opportunity_standards.map(&:summarize_for_lesson_edit),
      courseVersionId: lesson_group.script.get_course_version&.id,
      scriptIsVisible: !script.hidden,
      scriptPath: script_path(script),
      lessonPath: script_lesson_path(script, self),
      lessonExtrasAvailableForScript: script.lesson_extras_available
    }
  end

  def summarize_for_lesson_show(user, can_view_teacher_markdown)
    {
      id: id,
      unit: script.summarize_for_lesson_show,
      position: relative_position,
      lockable: lockable,
      key: key,
      displayName: localized_name,
      overview: Services::MarkdownPreprocessor.process(overview || ''),
      announcements: announcements,
      purpose: Services::MarkdownPreprocessor.process(purpose || ''),
      preparation: Services::MarkdownPreprocessor.process(preparation || ''),
      activities: lesson_activities.map {|la| la.summarize_for_lesson_show(can_view_teacher_markdown)},
      resources: resources_for_lesson_plan(user&.authorized_teacher?),
      vocabularies: vocabularies.map(&:summarize_for_lesson_show),
      programmingExpressions: programming_expressions.map(&:summarize_for_lesson_show),
      objectives: objectives.map(&:summarize_for_lesson_show),
      standards: standards.map(&:summarize_for_lesson_show),
      opportunityStandards: opportunity_standards.map(&:summarize_for_lesson_show),
      is_teacher: user&.teacher?,
      assessmentOpportunities: Services::MarkdownPreprocessor.process(assessment_opportunities),
      lessonPlanPdfUrl: lesson_plan_pdf_url,
      courseVersionStandardsUrl: course_version_standards_url,
      isVerifiedTeacher: user&.authorized_teacher?,
      hasVerifiedResources: lockable || lesson_plan_has_verified_resources,
      scriptResourcesPdfUrl: script_resource_pdf_url
    }
  end

  def summarize_for_rollup(user)
    {
      key: key,
      position: relative_position,
      displayName: localized_name,
      preparation: Services::MarkdownPreprocessor.process(preparation || ''),
      resources: resources_for_lesson_plan(user&.authorized_teacher?),
      vocabularies: vocabularies.map(&:summarize_for_lesson_show),
      programmingExpressions: programming_expressions.map(&:summarize_for_lesson_show),
      objectives: objectives.map(&:summarize_for_lesson_show),
      standards: standards.map(&:summarize_for_lesson_show),
      link: script_lesson_path(script, self)
    }
  end

  def summarize_for_student_lesson_plan
    all_resources = resources_for_lesson_plan(false)
    {
      id: id,
      unit: script.summarize_for_lesson_show(true),
      position: relative_position,
      key: key,
      displayName: localized_name,
      overview: student_overview || '',
      announcements: (announcements || []).select {|announcement| announcement['visibility'] != "Teacher-only"},
      resources: (all_resources['Student'] || []).concat(all_resources['All'] || []),
      vocabularies: vocabularies.map(&:summarize_for_lesson_show),
      programmingExpressions: programming_expressions.map(&:summarize_for_lesson_show),
      studentLessonPlanPdfUrl: student_lesson_plan_pdf_url
    }
  end

  def summarize_for_lesson_dropdown(is_student = false)
    {
      id: id,
      key: key,
      displayName: localized_name,
      link: is_student ? script_lesson_student_path(script, self) : script_lesson_path(script, self),
      position: relative_position
    }
  end

  # Provides a JSON summary of a particular lesson, that is consumed by tools used to
  # build lesson plans (Curriculum Builder)
  def summary_for_lesson_plans
    {
      # TODO: should be renamed after we combine CurriculumBuilder into LevelBuilder, if we still need this.
      stageName: localized_name,
      lockable: lockable?,
      levels: script_levels.map do |script_level|
        level = script_level.level
        level_json = {
          id: script_level.id,
          position: script_level.position,
          named_level: script_level.named_level?,
          bonus_level: !!script_level.bonus,
          assessment: script_level.assessment,
          progression: script_level.progression,
          path: script_level.path,
        }

        level_json.merge!(level.summary_for_lesson_plans)

        level_json
      end
    }
  end

  # Returns a hash representing i18n strings in scripts.en.yml which may need
  # to be updated after this object was updated. Currently, this only updates
  # the lesson name and overviews.
  def i18n_hash
    {
      script.name => {
        'lessons' => {
          key => {
            'name' => name,
            'description_student' => student_overview,
            'description_teacher' => overview
          }
        }
      }
    }
  end

  # For a given set of students, determine when the given lesson is locked for
  # each student.
  # The design of a lockable lesson is that there is (optionally) some number of
  # non-LevelGroup levels, followed by a single LevelGroup. This last one is the
  # only one which is truly locked/unlocked. The lesson is considered locked if
  # and only if the final assessment level is locked. When in this state, the UI
  # will show the entire lesson as being locked, but if you know the URL of the other
  # levels, you're still able to go to them and submit answers.
  def lockable_state(students)
    return unless lockable?

    script_level = script_levels.last
    unless script_level.assessment?
      raise 'Expect lockable lessons to have an assessment as their last level'
    end
    return students.map do |student|
      user_level = student.last_attempt_for_any script_level.levels, script_id: script.id
      # user_level_data is provided so that we can get back to our user_level
      # when updating. in some cases we don't yet have a user_level, and need
      # to provide enough data to create one

      # if we don't have a user level, consider ourselves locked
      locked = user_level.nil? || user_level.show_as_locked?(self)
      # if we don't have a user level, we can't be readonly
      readonly = user_level.present? && user_level.show_as_readonly?(self)
      {
        user_level_data: {
          user_id: student.id,
          level_id: user_level.try(:level).try(:id) || script_level.oldest_active_level.id,
          script_id: script_level.script.id
        },
        name: student.name,
        locked: locked,
        readonly_answers: readonly
      }
    end
  end

  # Ensures we get the cached ScriptLevels if they are being cached, vs hitting the db.
  def cached_script_levels
    return script_levels unless Script.should_cache?

    script_levels.map {|sl| Script.cache_find_script_level(sl.id)}
  end

  def last_progression_script_level
    script_levels.reverse.find(&:valid_progression_level?)
  end

  def next_level_for_lesson_extras(user)
    level_to_follow = script_levels.last.next_level
    level_to_follow = level_to_follow.next_level while level_to_follow.try(:locked_or_hidden?, user)
    level_to_follow
  end

  def next_level_path_for_lesson_extras(user)
    next_level = next_level_for_lesson_extras(user)
    next_level ?
      build_script_level_path(next_level) : script_completion_redirect(script)
  end

  def next_level_number_for_lesson_extras(user)
    next_level = next_level_for_lesson_extras(user)
    next_level ? next_level.lesson.relative_position : nil
  end

  def published?(user)
    return true if user&.levelbuilder?

    return true unless visible_after

    Time.parse(visible_after) <= Time.now
  end

  # Updates this lesson's lesson_activities to match the activities represented
  # by the provided data, preserving existing objects in cases where ids match.
  # @param activities [Array<Hash>] - Array of hashes representing
  #   LessonActivity objects.
  def update_activities(activities)
    return unless activities
    # use assignment to delete any missing activities.
    self.lesson_activities = activities.map do |activity|
      lesson_activity = fetch_activity(activity)
      lesson_activity.update!(
        position: activity['position'],
        name: activity['name'],
        duration: activity['duration']
      )

      lesson_activity.update_activity_sections(activity['activitySections'])
      lesson_activity
    end

    # It's too messy to keep track of all 3 position values for scripts during
    # this update, so just set activity_section_position as the source of truth
    # and then fix chapter and position values after.
    script.fix_script_level_positions
    # Reload the lesson to make sure the positions information we have is all up
    # to date
    reload
  end

  def update_objectives(objectives)
    return unless objectives

    self.objectives = objectives.map do |objective|
      persisted_objective = objective['id'].blank? ? Objective.new(key: SecureRandom.uuid) : Objective.find(objective['id'])
      persisted_objective.description = objective['description']
      persisted_objective.save!
      persisted_objective
    end
  end

  # Used for seeding from JSON. Returns the full set of information needed to
  # uniquely identify this object as well as any other objects it belongs to.
  # If the attributes of this object alone aren't sufficient, and associated objects are needed, then data from
  # the seeding_keys of those objects should be included as well.
  # Ideally should correspond to a unique index for this model's table.
  # See comments on ScriptSeed.seed_from_hash for more context.
  #
  # @param [ScriptSeed::SeedContext] seed_context - contains preloaded data to use when looking up associated objects
  # @return [Hash<String, String] all information needed to uniquely identify this object across environments.
  def seeding_key(seed_context)
    my_key = {'lesson.key': key}
    my_lesson_group = seed_context.lesson_groups.select {|lg| lg.id == lesson_group_id}.first
    raise "No LessonGroup found for #{self.class}: #{my_key}, LessonGroup ID: #{lesson_group_id}" unless my_lesson_group
    lesson_group_seeding_key = my_lesson_group.seeding_key(seed_context)
    my_key.merge!(lesson_group_seeding_key) {|key, _, _| raise "Duplicate key when generating seeding_key: #{key}"}
    my_key.stringify_keys
  end

  # Finds all other lessons which match the following criteria:
  # 1. the other lesson is in the same course offering as this lesson. Or, if
  # this lesson is in a CSF course offering, the other lesson may also be in
  # any other CSF course offering.
  # 2. same lesson key (untranslated lesson name)
  # The results are sorted first by version year and then by script name.
  #
  # This method is intended only to be used in levelbuilder mode, when script
  # caching is disabled.
  #
  # The purpose of this method is to help curriculum writers find lessons
  # related to the one they are currently editing in which they might want to
  # make similar edits. The heuristic used by this method is that the lesson key
  # will not change when a script is deep-copied into a new version year, or
  # when a lesson is shared across CSF courses within the same version year. If
  # this heuristic proves to be inadequate, we could consider adding an explicit
  # link between related lessons.
  #
  # @return [Array<Lesson>]
  def related_lessons
    return related_csf_lessons if script&.curriculum_umbrella == 'CSF'

    course_offering = script&.get_course_version&.course_offering
    return [] unless course_offering
    # all units in this course offering, including this lesson's unit
    related_units = course_offering.course_versions.map(&:units).flatten

    # to minimize the query count, make the initial query load any associations
    # that may be used in the sort block below.
    load_params = {
      script: [
        :course_version,
        {
          unit_group_units: {
            unit_group: :course_version
          }
        }
      ]
    }
    lessons = Lesson.eager_load(load_params).
      where(script: related_units).
      where(key: key).to_a

    # we cannot do the sort in the SQL query, because we don't know which
    # association get_course_version will use to find the course version.
    lessons.sort_by! do |lesson|
      version_year = lesson.script.get_course_version.version_year
      [version_year, lesson.script.name]
    end
    lessons - [self]
  end

  def related_csf_lessons
    # because curriculum umbrella is stored on the Script model, take a big
    # shortcut and look only at curriculum umbrella, ignoring course version
    # and course offering. In the future, when curriulum_umbrella moves to
    # CourseOffering, this implementation will need to change to be more like
    # related_lessons.
    lessons = Lesson.eager_load(script: :course_version).
      where("scripts.properties -> '$.curriculum_umbrella' = ?", script.curriculum_umbrella).
      where(key: key).
      order("scripts.properties -> '$.version_year'", 'scripts.name')
    lessons - [self]
  end

  # @return [Array<Hash>]
  def summarize_related_lessons
    related_lessons.map do |lesson|
      {
        scriptTitle: lesson.script.localized_title,
        versionYear: lesson.script.get_course_version&.version_year,
        lockable: lesson.lockable,
        relativePosition: lesson.relative_position,
        id: lesson.id,
        editUrl: edit_lesson_path(id: lesson.id)
      }
    end
  end

  def resources_for_lesson_plan(verified_teacher)
    grouped_resources = resources.map(&:summarize_for_lesson_plan).group_by {|r| r[:audience]}
    if verified_teacher && grouped_resources.key?('Verified Teacher')
      grouped_resources['Teacher'] ||= []
      grouped_resources['Teacher'] += grouped_resources['Verified Teacher']
    end
    grouped_resources.delete('Verified Teacher')
    grouped_resources
  end

  def lesson_plan_has_verified_resources
    resources.any? {|r| r.audience == 'Verified Teacher'}
  end

  # Makes a copy of original_lesson and adds it to the end last lesson group
  # in destination_script. It does not clone levels.
  # Both destination_script and the script original_lesson in must:
  # - be migrated
  # - be in a course version
  # - be in course versions from the same version year
  def self.copy_to_script(original_lesson, destination_script, new_level_suffix = nil)
    return if original_lesson.script == destination_script
    raise 'Both lesson and script must be migrated' unless original_lesson.script.is_migrated? && destination_script.is_migrated?
    raise 'Destination script and lesson must be in a course version' if destination_script.get_course_version.nil? || original_lesson.script.get_course_version.nil?

    ActiveRecord::Base.transaction(requires_new: true, joinable: false) do
      copied_lesson = original_lesson.dup
      copied_lesson.key = copied_lesson.name
      copied_lesson.script_id = destination_script.id

      destination_lesson_group = destination_script.lesson_groups.last
      unless destination_lesson_group
        destination_lesson_group = LessonGroup.create!(script: destination_script, position: 1, user_facing: true, display_name: 'New Lesson Group', key: 'new-lesson-group')
        Script.merge_and_write_i18n(destination_lesson_group.i18n_hash, destination_script.name)
      end
      copied_lesson.lesson_group_id = destination_lesson_group.id

      copied_lesson.absolute_position = destination_script.lessons.count + 1
      copied_lesson.relative_position =
        destination_script.lessons.select {|l| copied_lesson.numbered_lesson? == l.numbered_lesson?}.length + 1

      copied_lesson.save!

      # Copy lesson activities, activity sections, and script levels
      copied_lesson.lesson_activities = original_lesson.lesson_activities.map do |original_lesson_activity|
        copied_lesson_activity = original_lesson_activity.dup
        copied_lesson_activity.key = SecureRandom.uuid
        copied_lesson_activity.lesson_id = copied_lesson.id
        copied_lesson_activity.save!
        copied_lesson_activity.activity_sections = original_lesson_activity.activity_sections.map do |original_activity_section|
          copied_activity_section = original_activity_section.dup
          copied_activity_section.key = SecureRandom.uuid
          copied_activity_section.lesson_activity_id = copied_lesson_activity.id
          copied_activity_section.save!
          sl_data = original_activity_section.script_levels.map.with_index(1) do |original_script_level, pos|
            original_active_level = original_script_level.oldest_active_level
            copied_level = new_level_suffix.blank? ? original_active_level : original_active_level.clone_with_suffix(new_level_suffix)
            JSON.parse({assessment: original_script_level.assessment, bonus: original_script_level.bonus, challenge: original_script_level.challenge, levels: [copied_level], activitySectionPosition: pos}.to_json)
          end
          copied_activity_section.update_script_levels(sl_data) unless sl_data.blank?
          copied_activity_section
        end
        copied_lesson_activity
      end

      # Copy objectives
      copied_lesson.objectives = original_lesson.objectives.map do |original_objective|
        copied_objective = original_objective.dup
        copied_objective.key = SecureRandom.uuid
        copied_objective
      end

      # Copy programming expressions and standards associations
      copied_lesson.programming_expressions = original_lesson.programming_expressions
      copied_lesson.standards = original_lesson.standards
      copied_lesson.opportunity_standards = original_lesson.opportunity_standards

      # Copy objects that require course version, i.e. resources and vocab
      course_version = destination_script.get_course_version
      copied_lesson.resources = original_lesson.resources.map {|r| r.copy_to_course_version(course_version)}

      copied_lesson.vocabularies = original_lesson.vocabularies.map do |original_vocab|
        persisted_vocab = Vocabulary.where(word: original_vocab.word, course_version_id: course_version.id).first
        if persisted_vocab && !!persisted_vocab.common_sense_media == !!original_vocab.common_sense_media
          persisted_vocab
        else
          copied_vocab = Vocabulary.create!(word: original_vocab.word, definition: original_vocab.definition, common_sense_media: original_vocab.common_sense_media, course_version_id: course_version.id)
          copied_vocab
        end
      end.uniq

      copied_lesson.save!
      Script.merge_and_write_i18n(copied_lesson.i18n_hash, destination_script.name)
      destination_script.fix_script_level_positions
      destination_script.write_script_json
      copied_lesson
    end
  end

  private

  # Finds the LessonActivity by id, or creates a new one if id is not specified.
  # @param activity [Hash]
  # @returns [LessonActivity]
  def fetch_activity(activity)
    if activity['id']
      lesson_activity = lesson_activities.find(activity['id'])
      return lesson_activity if lesson_activity
      raise ActiveRecord::RecordNotFound.new("LessonActivity id #{activity['id']} not found in Lesson id #{id}")
    end

    lesson_activities.create(
      position: activity['position'],
      key: SecureRandom.uuid
    )
  end
end
