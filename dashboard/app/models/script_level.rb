# Joins a Script to a Level
# A Script has one or more Levels, and a Level can belong to one or more Scripts
class ScriptLevel < ActiveRecord::Base
  belongs_to :level
  belongs_to :script, inverse_of: :script_levels
  belongs_to :stage, inverse_of: :script_levels
  acts_as_list scope: :stage
  has_many :callouts, inverse_of: :script_level

  NEXT = 'next'

  def script
    Script.get_from_cache(script_id)
  end

  # this is a temporary (request-scope) variable set by User.rb#levels_from_script to find the UserLevel
  # corresponding to this ScriptLevel for a specific user
  attr_accessor :user_level

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
      I18n.t('user_stats.classroom_activity')
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
    @@script_level_map ||= ScriptLevel.includes([{level: [:game, :concepts]}, :script]).index_by(&:id)
    @@script_level_map[id]
  end
end
