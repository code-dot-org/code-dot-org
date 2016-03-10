# == Schema Information
#
# Table name: stages
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  position   :integer
#  script_id  :integer          not null
#  created_at :datetime
#  updated_at :datetime
#

# Ordered partitioning of script levels within a script
# (Intended to replace most of the functionality in Game, due to the need for multiple app types within a single Game/Stage)
class Stage < ActiveRecord::Base
  has_many :script_levels, -> { order('position ASC') }, inverse_of: :stage
  belongs_to :script, inverse_of: :stages
  acts_as_list scope: :script

  validates_uniqueness_of :name, scope: :script_id

  def script
    Script.get_from_cache(script_id)
  end

  def to_param
    position.to_s
  end

  def unplugged?
    script_levels = Script.get_from_cache(script.name).script_levels.select{|sl| sl.stage_id == self.id}
    return false unless script_levels.first
    script_levels.first.level.unplugged?
  end

  def localized_title
    if script.stages.to_a.many?
      I18n.t('stage_number', number: position) + ': ' + I18n.t("data.script.name.#{script.name}.#{name}")
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
    stage_data = {
        script_id: script.id,
        script_name: script.name,
        script_stages: script.stages.to_a.size,
        freeplay_links: script.freeplay_links,
        id: id,
        position: position,
        name: localized_name,
        title: localized_title,
        # Ensures we get the cached ScriptLevels, vs hitting the db
        levels: script.script_levels.to_a.select{|sl| sl.stage_id == id}.map(&:summarize),
    }

    # Go through all levels.  If we find an assessment with a per_page value,
    # then it's a long assessment: we assume it's the final level in the
    # stage, and generate some placeholder levels for the subsequent pages
    # of the long assessment.  Each of those levels will have the same basic
    # URL as the first, but with ?page=1, ?page=2, etc.

    levels = stage_data[:levels]

    # We might append additional levels, so iterate over the original set.
    levels[0..levels.length].each do |level|
      if level[:kind] == "assessment"
        level_info = Script.cache_find_level(level[:id])
        if level_info[:properties]["per_page"]
          extraLevelCount = level_info[:properties]["levels"].length / level_info[:properties]["per_page"].to_i - 1
          (1..extraLevelCount).each do |pageIndex|
            newLevel = level.deep_dup
            newLevel[:url] << "/page/#{pageIndex + 1}"
            newLevel[:position] = level[:position] + pageIndex
            newLevel[:title] = level[:title] + pageIndex
            levels << newLevel
          end
          level[:url] << "/page/1"
        end
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
end
