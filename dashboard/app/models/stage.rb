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
#  lockable          :boolean
#  relative_position :integer          not null
#
# Indexes
#
#  index_stages_on_script_id  (script_id)
#

# Ordered partitioning of script levels within a script
# (Intended to replace most of the functionality in Game, due to the need for multiple app types within a single Game/Stage)
class Stage < ActiveRecord::Base
  has_many :script_levels, -> { order('position ASC') }, inverse_of: :stage
  has_one :plc_learning_module, class_name: 'Plc::LearningModule', inverse_of: :stage, dependent: :destroy
  belongs_to :script, inverse_of: :stages

  # A stage has an absolute position and a relative position. The difference between the two is that relative_position
  # only accounts for other stages that have the same lockable setting, so if we have two lockable stages followed
  # by a non-lockable stage, the third stage will have an absolute_position of 3 but a relative_position of 1
  acts_as_list scope: :script, column: :absolute_position

  validates_uniqueness_of :name, scope: :script_id

  def script
    return Script.get_from_cache(script_id) if Script.should_cache?
    super
  end

  def to_param
    relative_position.to_s
  end

  def unplugged?
    script_levels = script.script_levels.select{|sl| sl.stage_id == id}
    return false unless script_levels.first
    script_levels.first.level.unplugged?
  end

  def localized_title
    # The standard case for localized_title is something like "Stage 1: Maze".
    # In the case of lockable stages, we don't want to include the Stage 1
    return I18n.t("data.script.name.#{script.name}.stage.#{name}") if lockable

    if script.stages.to_a.many?
      I18n.t('stage_number', number: relative_position) + ': ' + I18n.t("data.script.name.#{script.name}.stage.#{name}")
    else # script only has one stage/game, use the script name
      script.localized_title
    end
  end

  def localized_name
    if script.stages.many?
      I18n.t "data.script.name.#{script.name}.stage.#{name}"
    else
      I18n.t "data.script.name.#{script.name}.title"
    end
  end

  def localized_category
    I18n.t "flex_category.#{flex_category}" if flex_category
  end

  def lesson_plan_html_url
    "#{lesson_plan_base_url}/Teacher"
  end

  def lesson_plan_pdf_url
    "#{lesson_plan_base_url}/Teacher.pdf"
  end

  def lesson_plan_base_url
    CDO.code_org_url "/curriculum/#{script.name}/#{relative_position}"
  end

  def summarize
    stage_summary = Rails.cache.fetch("#{cache_key}/stage_summary/#{I18n.locale}") do
      stage_data = {
          script_id: script.id,
          script_name: script.name,
          script_stages: script.stages.to_a.size,
          freeplay_links: script.freeplay_links,
          id: id,
          position: absolute_position,
          name: localized_name,
          title: localized_title,
          flex_category: localized_category,
          lockable: !!lockable,
          levels: cached_script_levels.map(&:summarize),
      }

      # Use to_a here so that we get access to the cached script_levels.
      # Without it, script_levels.last goes back to the database.
      last_script_level = script_levels.to_a.last

      # The last level in a stage might be a multi-page assessment, in which
      # case we'll receive extra puzzle pages to be added to the existing summary.
      if last_script_level.long_assessment?
        last_level_summary = stage_data[:levels].last
        extra_levels = ScriptLevel.summarize_extra_puzzle_pages(last_level_summary)
        unless extra_levels.empty?
          stage_data[:levels] += extra_levels
          last_level_summary[:uid] = "#{last_level_summary[:ids].first}_0"
          last_level_summary[:url] << "/page/1"
        end
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

      stage_data
    end
    stage_summary.freeze
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
          path: script_level.path,
          level_id: level.id,
          type: level.class.to_s,
          name: level.name
        }

        %w(title questions answers instructions markdown_instructions markdown teacher_markdown pages).each do |key|
          value = level.properties[key] || level.try(key)
          level_json[key] = value if value
        end
        if level.video_key
          level_json[:video_youtube] = level.specified_autoplay_video.youtube_url
          level_json[:video_download] = level.specified_autoplay_video.download
        end

        level_json
      end
    }
  end

  def lockable_state(students)
    return unless lockable?

    # assumption that lockable selfs have a single (assessment) level
    if script_levels.length > 1
      raise 'Expect lockable stages to have a single script_level'
    end
    script_level = script_levels[0]
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

  # Ensures we get the cached ScriptLevels, vs hitting the db.
  def cached_script_levels
    script_levels.map{|sl| Script.cache_find_script_level(sl.id)}
  end
end
