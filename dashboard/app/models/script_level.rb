# Joins a Script to a Level
# A Script has one or more Levels, and a Level can belong to one or more Scripts
class ScriptLevel < ActiveRecord::Base
  belongs_to :level
  belongs_to :script, :touch => true
  belongs_to :stage, :touch => true
  acts_as_list scope: :stage

  NEXT = 'next'

  # this is a temporary (request-scope) variable set by User.rb#levels_from_script to find the UserLevel
  # corresponding to this ScriptLevel for a specific user
  attr_accessor :user_level

  def cache(name)
    Rails.cache.fetch("#{cache_key}/#{name}") do
      yield
    end
  end

  def next_level
    cache(:next_level) do
      script.script_levels.where(["chapter > ?", self.chapter]).order('chapter asc').first
    end
  end

  def next_progression_level
    next_level ? next_level.or_next_progression_level : nil
  end

  def or_next_progression_level
    valid_progression_level? ? self : next_progression_level
  end

  def valid_progression_level?
    cache(:valid_progression_level) do
      (level.unplugged? || (stage && stage.unplugged?)) ? false : true
    end
  end

  def previous_level
    cache(:previous_level) do
      if self.stage
        self.higher_item
      else
        self.script.try(:get_script_level_by_chapter, self.chapter - 1)
      end
    end
  end

  def end_of_stage?
    cache(:end_of_stage) do
      stage ? (self.last?) :
          next_progression_level && (level.game_id != next_progression_level.level.game_id)
    end
  end

  def stage_position_str
    stage ? I18n.t('stage_number', number: stage.position) : I18n.t("data.script.name.#{script.name}.#{level.game.name}")
  end

  def name
    I18n.t("data.script.name.#{script.name}.#{stage ? stage.name : level.game.name}")
  end

  def report_bug_url
    stage_text = stage ? "Stage #{stage.position} " : ' '
    message = "Bug in Course #{script.name} #{stage_text}Puzzle #{position}"
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

  def stage_or_game_position
    self.stage ? self.position : self.game_chapter
  end

  def stage_or_game_total
    cache(:stage_or_game_total) do
      stage ? stage.script_levels.count :
          script.script_levels_from_game(level.game_id).count
    end
  end

  def self.cache_find(id)
    @@script_level_map ||= ScriptLevel.includes(:level, :script).index_by(&:id)
    @@script_level_map[id]
  end
end
