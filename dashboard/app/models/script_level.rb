# == Schema Information
#
# Table name: script_levels
#
#  id          :integer          not null, primary key
#  level_id    :integer
#  script_id   :integer          not null
#  chapter     :integer
#  created_at  :datetime
#  updated_at  :datetime
#  stage_id    :integer
#  position    :integer
#  assessment  :boolean
#  properties  :text(65535)
#  named_level :boolean
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

  has_and_belongs_to_many :levels
  belongs_to :script, inverse_of: :script_levels
  belongs_to :stage, inverse_of: :script_levels
  has_many :callouts, inverse_of: :script_level
  has_one :plc_task, class_name: 'Plc::Task', inverse_of: :script_level, dependent: :destroy

  NEXT = 'next'

  def script
    return Script.get_from_cache(script_id) if Script.should_cache?
    super
  end

  # TODO(ram): stop using and delete these four convenience methods
  def level
    levels[0]
  end

  def level=(l)
    levels[0] = l
  end

  def level_id
    levels[0].id
  end

  def level_id=(new_level_id)
    levels[0] = Level.find(new_level_id)
  end

  def oldest_active_level
    return levels[0] if levels.length == 1
    return levels.min_by(&:created_at) unless properties
    properties_hash = JSON.parse(properties)
    levels.sort_by(&:created_at).find do |level|
      !properties_hash[level.name] || properties_hash[level.name]['active'] != false
    end
  end

  def has_another_level_to_go_to?
    if script.professional_learning_course?
      !end_of_stage?
    else
      next_progression_level
    end
  end

  def next_level_or_redirect_path_for_user(user)
    # if we're coming from an unplugged level, it's ok to continue
    # to unplugged level (example: if you start a sequence of
    # assessments associated with an unplugged level you should
    # continue on that sequence instead of skipping to next stage)
    level_to_follow = (level.unplugged? || stage.unplugged?) ? next_level : next_progression_level

    if script.professional_learning_course?
      if level.try(:plc_evaluation?)
        if Plc::EnrollmentUnitAssignment.exists?(user: user, plc_course_unit: script.plc_course_unit)
          script_preview_assignments_path(script)
        else
          build_script_level_path(level_to_follow)
        end
      else
        if has_another_level_to_go_to?
          build_script_level_path(level_to_follow)
        else
          script_path(script)
        end
      end
    else
      level_to_follow ? build_script_level_path(level_to_follow) : script_completion_redirect(script)
    end
  end

  def next_level
    i = script.script_levels.find_index(self)
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
    i = script.script_levels.find_index(self)
    return nil if i.nil? || i == 0
    script.script_levels[i - 1]
  end

  def end_of_stage?
    stage.script_levels.to_a.last == self
  end

  def end_of_script?
    script.script_levels.to_a.last == self
  end

  def long_assessment?
    return false unless assessment
    level.properties["pages"] ? level.properties["pages"].length > 1 : false
  end

  def anonymous?
    return assessment && level.properties["anonymous"] == "true"
  end

  def name
    stage.localized_name
  end

  def report_bug_url(request)
    message = "Bug in Course #{script.name} Stage #{stage.absolute_position} Puzzle #{position}\n#{request.url}\n#{request.user_agent}\n"
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
    stage.script_levels.to_a.size
  end

  def path
    build_script_level_path(self)
  end

  def summarize
    if level.unplugged?
      kind = 'unplugged'
    elsif named_level
      kind = 'named_level'
    elsif assessment
      kind = 'assessment'
    else
      kind = 'puzzle'
    end

    ids = level_ids

    levels.each do |l|
      ids.concat(l.contained_levels.map(&:id))
    end

    summary = {
        ids: ids,
        position: position,
        kind: kind,
        icon: level.icon,
        title: level_display_text,
        url: build_script_level_url(self)
    }

    summary[:name] = level.name if kind == 'named_level'

    # Add a previous pointer if it's not the obvious (level-1)
    if previous_level
      if previous_level.stage.absolute_position != stage.absolute_position
        summary[:previous] = [previous_level.stage.absolute_position, previous_level.position]
      end
    else
      # This is the first level in the script
      summary[:previous] = false
    end

    # Add a next pointer if it's not the obvious (level+1)
    if end_of_stage?
      if next_level
        summary[:next] = [next_level.stage.absolute_position, next_level.position]
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

  # Given a script level summary for the last level in a stage that has already
  # been determined to be a long assessment, returns an array of additional
  # level summaries.
  def self.summarize_extra_puzzle_pages(last_level_summary)
    extra_levels = []
    level_id = last_level_summary[:ids].first
    level = Level.cache_find_level(level_id)
    extra_level_count = level.properties["pages"].length - 1
    (1..extra_level_count).each do |page_index|
      new_level = last_level_summary.deep_dup
      new_level[:uid] = "#{level_id}_#{page_index}"
      new_level[:url] << "/page/#{page_index + 1}"
      new_level[:position] = last_level_summary[:position] + page_index
      new_level[:title] = last_level_summary[:position] + page_index
      extra_levels << new_level
    end
    extra_levels
  end

  # Returns a cached map from script level id to script_level, or nil if the
  # cache is disabled.
  def self.script_level_cache
    return nil unless Script.should_cache?
    @@script_level_cache ||= {}.tap do |cache|
      Script.script_cache.values.each do |script|
        cache.merge!(script.script_levels.index_by(&:id))
      end
    end
  end

  # Find the script level with the given id from the cache, unless the level build mode
  # is enabled in which case it is always fetched from the database. If we need to fetch
  # the script and we're not in level mode (for example because the script was created after
  # the cache), then an entry for the script is added to the cache.
  def self.cache_find(script_level_id)
    script_level = script_level_cache[script_level_id] if Script.should_cache?

    # If the cache missed or caching is disabled, fetch the script level from the db.
    if script_level.nil?
      script_level = ScriptLevel.find(script_level_id)
      # Cache the script level, unless it wasn't found.
      @@script_level_cache[script_level_id] = script_level if script_level && Script.should_cache?
    end
    script_level
  end

  def to_param
    position.to_s
  end

  # Given the signed-in user and an optional user that is being viewed
  # (e.g. a student viewed by a teacher), tell us whether we are allowed
  # to view their prior answer.
  def can_view_last_attempt(user, viewed_user)
    # If it's an anonymous survey, then teachers can't view student answers
    return false if user && viewed_user && user != viewed_user && anonymous?

    # Everything else is okay.
    return true
  end
end
