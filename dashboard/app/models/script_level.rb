# == Schema Information
#
# Table name: script_levels
#
#  id         :integer          not null, primary key
#  level_id   :integer          not null
#  script_id  :integer          not null
#  chapter    :integer
#  created_at :datetime
#  updated_at :datetime
#  stage_id   :integer
#  position   :integer
#  assessment :boolean
#
# Indexes
#
#  index_script_levels_on_level_id   (level_id)
#  index_script_levels_on_script_id  (script_id)
#  index_script_levels_on_stage_id   (stage_id)
#

# Joins a Script to a Level
# A Script has one or more Levels, and a Level can belong to one or more Scripts
class ScriptLevel < ActiveRecord::Base
  include LevelsHelper
  include Rails.application.routes.url_helpers

  belongs_to :level
  belongs_to :script, inverse_of: :script_levels
  belongs_to :stage, inverse_of: :script_levels
  acts_as_list scope: :stage
  has_many :callouts, inverse_of: :script_level

  NEXT = 'next'

  def script
    Script.get_from_cache(script_id)
  end

  def next_level
    i = script.script_levels.index(self)
    return nil if i.nil? || i == script.script_levels.length
    script.script_levels[i + 1]
  end

  def next_progression_level
    next_level ? next_level.or_next_progression_level : nil
  end

  def or_next_progression_level
    valid_progression_level? ? self : next_progression_level
  end

  def valid_progression_level?
    return false if level.unplugged?
    return false if stage && stage.unplugged?
    true
  end

  def previous_level
    i = script.script_levels.index(self)
    return nil if i.nil? || i == 0
    script.script_levels[i - 1]
  end

  def end_of_stage?
    stage.script_levels.to_a.last == self
  end

  def name
    I18n.t("data.script.name.#{script.name}.#{stage.name}")
  end

  def report_bug_url(request)
    message = "Bug in Course #{script.name} Stage #{stage.position} Puzzle #{position}\n#{request.url}\n#{request.user_agent}\n"
    "https://support.code.org/hc/en-us/requests/new?&description=#{CGI.escape(message)}"
  end

  def level_display_text
    if level.unplugged?
      I18n.t('unplugged_activity')
    elsif stage.unplugged?
      position - 1
    else
      position
    end
  end

  def stage_total
    stage.script_levels.to_a.count
  end

  def summarize
    if level.unplugged?
      kind = 'unplugged'
    elsif assessment
      kind = 'assessment'
    else
      kind = 'puzzle'
    end

    summary = {
        id: level.id,
        position: position,
        kind: kind,
        title: level_display_text,
        url: build_script_level_path(self)
    }

    # Add a previous pointer if it's not the obvious (level-1)
    if previous_level
      if previous_level.stage.position != stage.position
        summary[:previous] = [previous_level.stage.position, previous_level.position]
      end
    else
      # This is the first level in the script
      summary[:previous] = false
    end

    # Add a next pointer if it's not the obvious (level+1)
    if end_of_stage?
      if next_level
        summary[:next] = [next_level.stage.position, next_level.position]
      else
        # This is the final level in the script
        summary[:next] = false
        if script.wrapup_video
          summary[:wrapupVideo] = script.wrapup_video.summarize
        end
      end
    end

    summary
  end

  def self.cache_find(id)
    Script.cache_find_script_level(id)
  end

  def to_param
    position.to_s
  end
end
