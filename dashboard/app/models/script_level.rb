# == Schema Information
#
# Table name: script_levels
#
#  id          :integer          not null, primary key
#  script_id   :integer          not null
#  chapter     :integer
#  created_at  :datetime
#  updated_at  :datetime
#  stage_id    :integer
#  position    :integer
#  assessment  :boolean
#  properties  :text(65535)
#  named_level :boolean
#  bonus       :boolean
#
# Indexes
#
#  index_script_levels_on_script_id  (script_id)
#  index_script_levels_on_stage_id   (stage_id)
#

require 'cdo/shared_constants'

# Joins a Script to a Level
# A Script has one or more Levels, and a Level can belong to one or more Scripts
class ScriptLevel < ActiveRecord::Base
  include SerializedProperties
  include LevelsHelper
  include SharedConstants
  include Rails.application.routes.url_helpers

  has_and_belongs_to_many :levels
  belongs_to :script, inverse_of: :script_levels
  belongs_to :stage, inverse_of: :script_levels
  has_many :callouts, inverse_of: :script_level
  has_one :plc_task, class_name: 'Plc::Task', inverse_of: :script_level, dependent: :destroy

  serialized_attrs %w(
    variants
    progression
    target
    challenge
    hint_prompt_attempts_threshold
  )

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
    return levels.min_by(&:created_at) unless variants

    levels.sort_by(&:created_at).find do |level|
      !variants[level.name] || variants[level.name]['active'] != false
    end
  end

  def find_experiment_level(user, section)
    levels.sort_by(&:created_at).find do |level|
      experiments(level).any? do |experiment_name|
        Experiment.enabled?(
          experiment_name: experiment_name,
          user: user,
          section: section,
          script: script
        )
      end
    end
  end

  def active?(level)
    !variants || !variants[level.name] || variants[level.name]['active'] != false
  end

  def experiments(level)
    return [] if !variants || !variants[level.name]
    variants[level.name]['experiments'] || []
  end

  def has_experiment?
    levels.any? {|level| experiments(level).any?}
  end

  def has_another_level_to_go_to?
    if script.professional_learning_course?
      !end_of_stage?
    else
      next_progression_level
    end
  end

  def final_level?
    !has_another_level_to_go_to?
  end

  def next_level_or_redirect_path_for_user(user)
    # if we're coming from an unplugged level, it's ok to continue to unplugged
    # level (example: if you start a sequence of assessments associated with an
    # unplugged level you should continue on that sequence instead of skipping to
    # next stage)
    if valid_progression_level?(user)
      level_to_follow = next_progression_level(user)
    else
      # don't ever continue continue to a locked/hidden level
      level_to_follow = next_level
      level_to_follow = level_to_follow.next_level while level_to_follow.try(:locked_or_hidden?, user)
    end

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
    elsif bonus
      script_stage_extras_path(script.name, stage.relative_position)
    else
      level_to_follow ? build_script_level_path(level_to_follow) : script_completion_redirect(script)
    end
  end

  # Return the next script level after this one in the script, or nil if this is last
  def next_level
    i = script.script_levels.find_index(self)
    return nil if i.nil? || i == script.script_levels.length
    script.script_levels[i + 1]
  end

  # Returns the next valid progression level, or nil if no such level exists
  def next_progression_level(user=nil)
    next_level ? next_level.or_next_progression_level(user) : nil
  end

  # Returns the first level in the sequence starting with this one that is a
  # valid progress level
  def or_next_progression_level(user=nil)
    valid_progression_level?(user) ? self : next_progression_level(user)
  end

  def valid_progression_level?(user=nil)
    return false if level.unplugged?
    return false if stage && stage.unplugged?
    return false if I18n.locale != I18n.default_locale && level.spelling_bee?
    return false if I18n.locale != I18n.default_locale && stage && stage.spelling_bee?
    return false if locked_or_hidden?(user)
    return false if bonus
    true
  end

  def locked_or_hidden?(user)
    user && (locked?(user) || user.script_level_hidden?(self))
  end

  def locked?(user)
    return false unless stage.lockable?
    return false if user.authorized_teacher?

    # All levels in a stage key their lock state off of the last script_level
    # in the stage, which is an assessment. Thus, to answer the question of
    # whether the nth level is locked, we must look at the last level
    last_script_level = stage.script_levels.last
    user_level = user.user_level_for(last_script_level, last_script_level.oldest_active_level)
    # There will initially be no user_level for the assessment level, at which
    # point it is considered locked. As soon as it gets unlocked, we will always
    # have a user_level
    user_level.nil? || user_level.locked?(stage)
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
    !!level.properties["pages"]
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

  def summarize(include_prev_next=true)
    if level.unplugged?
      kind = LEVEL_KIND.unplugged
    elsif assessment
      kind = LEVEL_KIND.assessment
    else
      kind = LEVEL_KIND.puzzle
    end

    ids = level_ids

    levels.each do |l|
      ids.concat(l.contained_levels.map(&:id))
    end

    summary = {
      ids: ids,
      activeId: oldest_active_level.id,
      position: position,
      kind: kind,
      icon: level.icon,
      is_concept_level: level.concept_level?,
      title: level_display_text,
      url: build_script_level_url(self),
      freePlay: level.try(:free_play) == "true",
    }

    summary[:progression] = progression if progression

    if named_level
      summary[:name] = level.display_name || level.name
    end

    if Rails.application.config.levelbuilder_mode
      summary[:key] = level.key
      summary[:skin] = level.try(:skin)
      summary[:videoKey] = level.video_key
      summary[:concepts] = level.summarize_concepts
      summary[:conceptDifficulty] = level.summarize_concept_difficulty
    end

    if include_prev_next
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
    end

    summary
  end

  # Given a script level summary for the last level in a stage that has already
  # been determined to be a long assessment, returns an array of additional
  # level summaries.
  def self.summarize_extra_puzzle_pages(last_level_summary)
    extra_levels = []
    level_id = last_level_summary[:ids].first
    level = Script.cache_find_level(level_id)
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

  def summarize_as_bonus(user)
    {
      id: id,
      name: level.display_name || level.name,
      type: level.type,
      map: JSON.parse(level.try(:maze) || '[]'),
      serialized_maze: level.try(:serialized_maze) && JSON.parse(level.try(:serialized_maze)),
      skin: level.try(:skin),
      solution_image_url: level.try(:solution_image_url),
      perfected: !!UserLevel.find_by(user: user, script: script, level: level).try(:perfect?),
      level: level.summarize_as_bonus.camelize_keys,
    }.camelize_keys
  end

  def self.cache_find(id)
    Script.cache_find_script_level(id)
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

  # Is this script_level hidden for the current section, either because the stage
  # it is contained in is hidden, or the script it is contained in is hidden.
  def hidden_for_section?(section_id)
    return false if section_id.nil?
    !SectionHiddenStage.find_by(stage_id: stage.id, section_id: section_id).nil? ||
      !SectionHiddenScript.find_by(script_id: stage.script.id, section_id: section_id).nil?
  end
end
