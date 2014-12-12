# Joins a Script to a Level
# A Script has one or more Levels, and a Level can belong to one or more Scripts
class ScriptLevel < ActiveRecord::Base
  belongs_to :level
  belongs_to :script, inverse_of: :script_levels
  belongs_to :stage, inverse_of: :script_levels
  acts_as_list scope: :stage
  has_many :callouts, inverse_of: :script_level

  NEXT = 'next'

  # this is a temporary (request-scope) variable set by User.rb#levels_from_script to find the UserLevel
  # corresponding to this ScriptLevel for a specific user
  attr_accessor :user_level

  def next_level
    cached_script = Script.get_from_cache(self.script_id) if self.script.should_be_cached?
    if cached_script
      i = cached_script.script_levels.index(self)
      return nil if i.nil? || i == cached_script.script_levels.length
      cached_script.script_levels[i + 1]
    else
      script.script_levels.where(["chapter > ?", self.chapter]).order('chapter asc').first
    end
  end

  def next_progression_level
    next_level ? next_level.or_next_progression_level : nil
  end

  def or_next_progression_level
    valid_progression_level? ? self : next_progression_level
  end

  def cached_valid_progression_level?
    cached_script = Script.get_from_cache(script_id)
    cached_script_level = cached_script.script_levels.to_a.find{|sl| sl.id == self.id}
    return false if cached_script_level.level.unplugged?
    return false if cached_script_level.stage && cached_script_level.stage.unplugged?
    true
  end

  def valid_progression_level?
    return cached_valid_progression_level? if Script.should_be_cached?(script_id)
    return false if level.unplugged?
    return false if stage && stage.unplugged?
    true
  end

  def previous_level
    cached_script = Script.get_from_cache(self.script_id) if self.script.should_be_cached?
    if cached_script
      i = cached_script.script_levels.index(self)
      return nil if i.nil? || i == 0
      cached_script.script_levels[i - 1]
    else
      script.script_levels.where(["chapter < ?", self.chapter]).order('chapter desc').first
    end
  end

  def cached_last?
    cached_script = Script.get_from_cache(self.script_id) if self.script.should_be_cached?
    if cached_script
      i = cached_script.script_levels.index(self)
      return i == cached_script.script_levels.length
    else
      self.last?
    end
  end

  def end_of_stage?
    stage ? (cached_last?) :
      next_progression_level && (level.game_id != next_progression_level.level.game_id)
  end

  def stage_position_str
    stage ? I18n.t('stage_number', number: stage.position) : I18n.t("data.script.name.#{script.name}.#{level.game.name}")
  end

  def name
    I18n.t("data.script.name.#{script.name}.#{stage ? stage.name : level.game.name}")
  end

  def report_bug_url(request)
    stage_text = stage ? "Stage #{stage.position} " : ' '
    message = "Bug in Course #{script.name} #{stage_text}Puzzle #{position}\n#{request.url}\n#{request.user_agent}\n"
    "https://support.code.org/hc/en-us/requests/new?&description=#{CGI.escape(message)}"
  end

  def level_display_text
    if level.unplugged?
      I18n.t('user_stats.classroom_activity')
    elsif stage && stage.unplugged?
      stage_or_game_position - 1
    else
      stage_or_game_position
    end
  end

  def stage_or_game
    stage ? stage : level.game
  end

  def stage_or_game_position
    self.stage ? self.position : self.game_chapter
  end

  def stage_or_game_total
    @@stage_or_game_total ||= {}
    @@stage_or_game_total[self.id] ||=
      stage ? stage.script_levels.count :
              script.script_levels_from_game(level.game_id).count
  end

  def self.cache_find(id)
    @@script_level_map ||= ScriptLevel.includes([{level: [:game, :concepts]}, :script]).index_by(&:id)
    @@script_level_map[id]
  end
end
