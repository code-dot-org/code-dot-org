# == Schema Information
#
# Table name: stages
#
#  id            :integer          not null, primary key
#  name          :string(255)      not null
#  position      :integer
#  script_id     :integer          not null
#  created_at    :datetime
#  updated_at    :datetime
#  flex_category :string(255)
#  lockable      :boolean
#

# Ordered partitioning of script levels within a script
# (Intended to replace most of the functionality in Game, due to the need for multiple app types within a single Game/Stage)
class Stage < ActiveRecord::Base
  has_many :script_levels, -> { order('position ASC') }, inverse_of: :stage
  has_one :plc_learning_module, class_name: 'Plc::LearningModule', inverse_of: :stage, dependent: :destroy
  belongs_to :script, inverse_of: :stages
  acts_as_list scope: :script

  validates_uniqueness_of :name, scope: :script_id

  def script
    return Script.get_from_cache(script_id) if Script.should_cache?
    super
  end

  def to_param
    position.to_s
  end

  def unplugged?
    script_levels = script.script_levels.select{|sl| sl.stage_id == self.id}
    return false unless script_levels.first
    script_levels.first.level.unplugged?
  end

  def localized_title
    # The standard case for localized_title is something like "Stage 1: Maze".
    # In the case of lockable stages, we don't want to include the Stage 1
    return I18n.t("data.script.name.#{script.name}.#{name}") if lockable

    if script.stages.to_a.many?
      # Because lockable stages aren't numbered, our stage number is actually our
      # position, minus the number of lockable stages preceeding us
      stage_number = position - script.stages.to_a[0, position].count(&:lockable)

      I18n.t('stage_number', number: stage_number) + ': ' + I18n.t("data.script.name.#{script.name}.#{name}")
    else # script only has one stage/game, use the script name
      script.localized_title
    end
  end

  def localized_name
    if script.stages.many?
      I18n.t "data.script.name.#{script.name}.#{name}"
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
    CDO.code_org_url "/curriculum/#{script.name}/#{position}"
  end

  def summarize
    stage_summary = Rails.cache.fetch("#{cache_key}/stage_summary/#{I18n.locale}") do
      stage_data = {
          script_id: script.id,
          script_name: script.name,
          script_stages: script.stages.to_a.size,
          freeplay_links: script.freeplay_links,
          id: id,
          position: position,
          name: localized_name,
          title: localized_title,
          flex_category: localized_category,
          lockable: !!lockable,
          # Ensures we get the cached ScriptLevels, vs hitting the db
          levels: script.script_levels.to_a.select{|sl| sl.stage_id == id}.map(&:summarize),
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

      if script.has_lesson_plan?
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
end
