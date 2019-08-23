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
#  flex_category     :string(255)
#  lockable          :boolean          default(FALSE), not null
#  relative_position :integer          not null
#  properties        :text(65535)
#
# Indexes
#
#  index_stages_on_script_id  (script_id)
#

require 'cdo/shared_constants'

# Ordered partitioning of script levels within a script
# (Intended to replace most of the functionality in Game, due to the need for multiple app types within a single Game/Stage)
class Stage < ActiveRecord::Base
  include LevelsHelper
  include SharedConstants
  include Rails.application.routes.url_helpers
  include SerializedProperties

  has_many :script_levels, -> {order('position ASC')}, inverse_of: :stage
  has_one :plc_learning_module, class_name: 'Plc::LearningModule', inverse_of: :stage, dependent: :destroy
  belongs_to :script, inverse_of: :stages

  serialized_attrs %w(
    stage_extras_disabled
  )

  # A stage has an absolute position and a relative position. The difference between the two is that relative_position
  # only accounts for other stages that have the same lockable setting, so if we have two lockable stages followed
  # by a non-lockable stage, the third stage will have an absolute_position of 3 but a relative_position of 1
  acts_as_list scope: :script, column: :absolute_position

  validates_uniqueness_of :name, scope: :script_id

  include CodespanOnlyMarkdownHelper

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

  def spelling_bee?
    script_levels = script.script_levels.select {|sl| sl.stage_id == id}
    return false unless script_levels.first
    script_levels.first.oldest_active_level.spelling_bee?
  end

  def localized_title
    # The standard case for localized_title is something like "Stage 1: Maze".
    # In the case of lockable stages, we don't want to include the Stage 1
    return localized_name if lockable

    if script.stages.to_a.many?
      I18n.t('stage_number', number: relative_position) + ': ' + localized_name
    else # script only has one stage/game, use the script name
      script.localized_title
    end
  end

  def localized_name
    if script.stages.many?
      I18n.t "data.script.name.#{script.name}.stages.#{name}.name"
    else
      I18n.t "data.script.name.#{script.name}.title"
    end
  end

  def localized_category
    if flex_category
      I18n.t "flex_category.#{flex_category}"
    else
      I18n.t "flex_category.content"
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
    stage_summary = Rails.cache.fetch("#{cache_key}/stage_summary/#{I18n.locale}/#{include_bonus_levels}") do
      cached_levels = include_bonus_levels ? cached_script_levels : cached_script_levels.reject(&:bonus)

      stage_data = {
        script_id: script.id,
        script_name: script.name,
        script_stages: script.stages.to_a.size,
        id: id,
        position: absolute_position,
        relative_position: relative_position,
        name: localized_name,
        title: localized_title,
        flex_category: localized_category,
        lockable: !!lockable,
        levels: cached_levels.map {|l| l.summarize(false)},
        description_student: render_codespan_only_markdown(I18n.t("data.script.name.#{script.name}.stages.#{name}.description_student", default: '')),
        description_teacher: render_codespan_only_markdown(I18n.t("data.script.name.#{script.name}.stages.#{name}.description_teacher", default: ''))
      }

      # Use to_a here so that we get access to the cached script_levels.
      # Without it, script_levels.last goes back to the database.
      last_script_level = script_levels.to_a.last

      # The last level in a stage might be a long assessment, so add extra information
      # related to that.  This might include information for additional pages if it
      # happens to be a multi-page long assessment.
      if last_script_level.long_assessment?
        last_level_summary = stage_data[:levels].last
        extra_levels = ScriptLevel.summarize_extra_puzzle_pages(last_level_summary)
        stage_data[:levels] += extra_levels
        last_level_summary[:uid] = "#{last_level_summary[:ids].first}_0"
        last_level_summary[:url] << "/page/1"
      end

      # Don't want lesson plans for lockable levels
      if !lockable && script.has_lesson_plan?
        stage_data[:lesson_plan_html_url] = lesson_plan_html_url
        stage_data[:lesson_plan_pdf_url] = lesson_plan_pdf_url
      end

      if script.hoc?
        stage_data[:finishLink] = script.hoc_finish_url
        stage_data[:finishText] = I18n.t('nav.header.finished_hoc')
      end

      if !unplugged? && !stage_extras_disabled
        stage_data[:stage_extras_level_url] = script_stage_extras_url(script.name, stage_position: relative_position)
      end

      stage_data
    end
    stage_summary.freeze
  end

  def summarize_for_edit
    summary = summarize.dup
    # Do not let script name override stage name when there is only one stage
    summary[:name] = I18n.t("data.script.name.#{script.name}.stages.#{name}.name")
    # Do not use a default value if flex_category is nil
    summary[:flex_category] = flex_category && I18n.t("flex_category.#{flex_category}")
    summary.freeze
  end

  # Provides a JSON summary of a particular stage, that is consumed by tools used to
  # build lesson plans
  def summary_for_lesson_plans
    {
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

  # For a given set of students, determine when the given stage is locked for
  # each student.
  # The design of a lockable stage is that there is (optionally) some number of
  # non-LevelGroup levels, followed by a single LevelGroup. This last one is the
  # only one which is truly locked/unlocked. The stage is considered locked if
  # and only ifthe final assessment level is locked. When in this state, the UI
  # will show the entire stage as being locked, but if you know the URL of the other
  # levels, you're still able to go to them and submit answers.
  def lockable_state(students)
    return unless lockable?

    script_level = script_levels.last
    unless script_level.assessment?
      raise 'Expect lockable stages to have an assessment as their last level'
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

  def next_level_path_for_stage_extras(user)
    level_to_follow = script_levels.last.next_level
    level_to_follow = level_to_follow.next_level while level_to_follow.try(:locked_or_hidden?, user)
    level_to_follow ? build_script_level_path(level_to_follow) : script_completion_redirect(script)
  end
end
