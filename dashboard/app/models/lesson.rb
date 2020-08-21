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
#  key               :string(255)
#
# Indexes
#
#  index_stages_on_script_id  (script_id)
#

require 'cdo/shared_constants'

# Ordered partitioning of script levels within a script
# (Intended to replace most of the functionality in Game, due to the need for multiple app types within a single Lesson)
class Lesson < ActiveRecord::Base
  include LevelsHelper
  include SharedConstants
  include Rails.application.routes.url_helpers
  include SerializedProperties

  belongs_to :script, inverse_of: :lessons
  belongs_to :lesson_group
  has_many :script_levels, -> {order(:chapter)}, foreign_key: 'stage_id', dependent: :destroy
  has_many :levels, through: :script_levels

  has_one :plc_learning_module, class_name: 'Plc::LearningModule', inverse_of: :lesson, foreign_key: 'stage_id', dependent: :destroy
  has_and_belongs_to_many :standards, foreign_key: 'stage_id'

  self.table_name = 'stages'

  serialized_attrs %w(
    overview
    visible_after
  )

  # A lesson has an absolute position and a relative position. The difference between the two is that relative_position
  # only accounts for other lessons that have the same lockable setting, so if we have two lockable lessons followed
  # by a non-lockable lesson, the third lesson will have an absolute_position of 3 but a relative_position of 1
  acts_as_list scope: :script, column: :absolute_position

  #validates_uniqueness_of :name, scope: :script_id TODO: Add this back after we have moved over to new key/name systems for lesson
  validates_uniqueness_of :key, scope: :script_id

  include CodespanOnlyMarkdownHelper

  def self.add_lessons(script, lesson_group, raw_lessons, counters, new_suffix, editor_experiment)
    raw_lessons.map do |raw_lesson|
      Lesson.prevent_empty_lesson(raw_lesson)
      Lesson.prevent_blank_display_name(raw_lesson)
      Lesson.prevent_changing_stable_i18n_key(script, raw_lesson)

      lesson = script.lessons.detect {|l| l.key == raw_lesson[:key]} ||
        Lesson.find_or_create_by(
          key: raw_lesson[:key],
          script: script
        ) do |l|
          l.name = "" # will be updated below, but cant be null
          l.relative_position = 0 # will be updated below, but cant be null
        end

      lesson.assign_attributes(
        name: raw_lesson[:name],
        absolute_position: (counters.lesson_position += 1),
        lesson_group: lesson_group,
        lockable: !!raw_lesson[:lockable],
        visible_after: raw_lesson[:visible_after],
        relative_position: !!raw_lesson[:lockable] ? (counters.lockable_count += 1) : (counters.non_lockable_count += 1)
      )
      lesson.save! if lesson.changed?

      lesson.script_levels = ScriptLevel.add_script_levels(script, lesson, raw_lesson[:script_levels], counters, new_suffix, editor_experiment)
      lesson.save!

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

  def self.prevent_empty_lesson(raw_lesson)
    raise "Lessons must have at least one level in them.  Lesson: #{raw_lesson[:name]}." if raw_lesson[:script_levels].empty?
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

  def unplugged?
    script_levels = script.script_levels.select {|sl| sl.stage_id == id}
    return false unless script_levels.first
    script_levels.first.oldest_active_level.unplugged?
  end

  # This is currently only relevant to CSF levels, which use the Unplugged
  # level type. As an alternative to the Unplugged level type, Levelbuilders
  # can select if External/Markdown levels should display as unplugged.
  def display_as_unplugged
    script_levels = script.script_levels.select {|sl| sl.stage_id == id}
    return false unless script_levels.first
    script_levels.first.oldest_active_level.properties["display_as_unplugged"] == "true" || unplugged?
  end

  def spelling_bee?
    script_levels = script.script_levels.select {|sl| sl.stage_id == id}
    return false unless script_levels.first
    script_levels.first.oldest_active_level.spelling_bee?
  end

  def localized_title
    # The standard case for localized_title is something like "Lesson 1: Maze".
    # In the case of lockable lessons, we don't want to include the Lesson 1
    return localized_name if lockable

    if script.lessons.to_a.many?
      I18n.t('stage_number', number: relative_position) + ': ' + localized_name
    else # script only has one lesson, use the script name
      script.localized_title
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
    "#{lesson_plan_base_url}/Teacher.pdf"
  end

  def lesson_plan_base_url
    CDO.code_org_url "/curriculum/#{script.name}/#{relative_position}"
  end

  def summarize(include_bonus_levels = false)
    lesson_summary = Rails.cache.fetch("#{cache_key}/lesson_summary/#{I18n.locale}/#{include_bonus_levels}") do
      cached_levels = include_bonus_levels ? cached_script_levels : cached_script_levels.reject(&:bonus)

      lesson_data = {
        script_id: script.id,
        script_name: script.name,
        num_script_lessons: script.lessons.to_a.size,
        id: id,
        position: absolute_position,
        relative_position: relative_position,
        name: localized_name,
        title: localized_title,
        lesson_group_display_name: lesson_group&.localized_display_name,
        lockable: !!lockable,
        levels: cached_levels.map {|l| l.summarize(false)},
        description_student: render_codespan_only_markdown(I18n.t("data.script.name.#{script.name}.lessons.#{key}.description_student", default: '')),
        description_teacher: render_codespan_only_markdown(I18n.t("data.script.name.#{script.name}.lessons.#{key}.description_teacher", default: '')),
        unplugged: display_as_unplugged
      }

      # Use to_a here so that we get access to the cached script_levels.
      # Without it, script_levels.last goes back to the database.
      last_script_level = script_levels.to_a.last

      # The last level in a lesson might be a long assessment, so add extra information
      # related to that.  This might include information for additional pages if it
      # happens to be a multi-page long assessment.
      if last_script_level.long_assessment?
        last_level_summary = lesson_data[:levels].last
        extra_levels = ScriptLevel.summarize_extra_puzzle_pages(last_level_summary)
        lesson_data[:levels] += extra_levels
        last_level_summary[:uid] = "#{last_level_summary[:ids].first}_0"
        last_level_summary[:url] << "/page/1"
      end

      # Don't want lesson plans for lockable levels
      if !lockable && script.has_lesson_plan?
        lesson_data[:lesson_plan_html_url] = lesson_plan_html_url
        lesson_data[:lesson_plan_pdf_url] = lesson_plan_pdf_url
      end

      if script.hoc?
        lesson_data[:finishLink] = script.hoc_finish_url
        lesson_data[:finishText] = I18n.t('nav.header.finished_hoc')
      end

      lesson_data[:lesson_extras_level_url] = script_stage_extras_url(script.name, stage_position: relative_position) unless unplugged?

      lesson_data
    end
    lesson_summary.freeze
  end

  def summarize_for_edit
    summary = summarize.dup
    # Do not let script name override lesson name when there is only one lesson
    summary[:name] = I18n.t("data.script.name.#{script.name}.lessons.#{key}.name")
    summary.freeze
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
      # user_level_data is provided so that we can get back to our user_level when updating. in some cases we
      # don't yet have a user_level, and need to provide enough data to create one
      {
        user_level_data: {
          user_id: student.id,
          level_id: user_level.try(:level).try(:id) || script_level.oldest_active_level.id,
          script_id: script_level.script.id
        },
        name: student.name,
        # if we don't have a user level, consider ourselves locked
        locked: user_level ? user_level.locked?(self) : true,
        readonly_answers: user_level ? !user_level.locked?(self) && user_level.readonly_answers? : false
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
end
