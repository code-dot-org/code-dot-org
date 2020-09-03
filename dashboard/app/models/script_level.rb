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

  belongs_to :script
  belongs_to :lesson, foreign_key: 'stage_id'
  has_and_belongs_to_many :levels
  has_many :callouts, inverse_of: :script_level

  validate :anonymous_must_be_assessment

  # Make sure we never create a level that is not an assessment, but is anonymous,
  # as in that case it wouldn't actually be treated as anonymous
  def anonymous_must_be_assessment
    if anonymous? && !assessment
      errors.add(:script_level, "Only assessments can be anonymous in \"#{level.try(:name)}\"")
    end
  end

  serialized_attrs %w(
    variants
    progression
    challenge
  )

  # Chapter values order all the script_levels in a script.
  def self.add_script_levels(script, lesson, raw_script_levels, counters, new_suffix, editor_experiment)
    script_level_position = 0

    raw_script_levels.map do |raw_script_level|
      raw_script_level.symbolize_keys!

      properties = raw_script_level.delete(:properties) || {}
      raw_levels = raw_script_level[:levels]

      # variants are deprecated. when cloning a script, retain only the first
      # active level in each script level, discarding any variants.
      if new_suffix && raw_levels.length > 1
        first_active_level = raw_levels.find do |raw_level|
          variant = properties[:variants].try(:[], raw_level[:name])
          !(variant && variant[:active] == false)
        end
        raw_levels = [first_active_level]
        properties.delete(:variants)
      end

      levels = Level.add_levels(raw_levels, script, new_suffix, editor_experiment)

      script_level_attributes = {
        script_id: script.id,
        stage_id: lesson.id,
        chapter: (counters.chapter += 1),
        position: (script_level_position += 1),
        named_level: raw_script_level[:named_level],
        bonus: raw_script_level[:bonus],
        assessment: raw_script_level[:assessment],
        properties: properties.with_indifferent_access
      }
      script_level = script.script_levels.detect do |sl|
        script_level_attributes.all? {|k, v| sl.send(k) == v} &&
          sl.levels == levels
      end || ScriptLevel.create!(script_level_attributes) do |sl|
        sl.levels = levels
      end

      script_level.assign_attributes(script_level_attributes)
      script_level.save! if script_level.changed?
      script_level
    end
  end

  def script
    return Script.get_from_cache(script_id) if Script.should_cache?
    super
  end

  # WARNING: Using either of these two convenience methods can lead to bugs with
  # level swapping, because we might not actually be using the first level.
  # Consider using oldest_active_level instead, or see
  # ScriptLevelsController#select_level for how we select the right level to
  # show on puzzle pages.
  # TODO(elijah): stop using and delete these methods
  def level
    levels[0]
  end

  def level_id
    levels[0].id
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

  def next_level_or_redirect_path_for_user(
    user,
    extras_lesson=nil,
    bubble_choice_parent=false
  )
    if bubble_choice? && !bubble_choice_parent
      # Redirect user back to the BubbleChoice activity page from sublevels.
      level_to_follow = self
    elsif valid_progression_level?(user)
      # if we're coming from an unplugged level, it's ok to continue to unplugged
      # level (example: if you start a sequence of assessments associated with an
      # unplugged level you should continue on that sequence instead of skipping to
      # next lesson)
      level_to_follow = next_progression_level(user)
    else
      # don't ever continue to a locked/hidden level
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
      # If we got to this bonus level from another lesson's lesson extras, go back
      # to that lesson
      script_stage_extras_path(script.name, (extras_lesson || lesson).relative_position)
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
    return false if lesson && lesson.unplugged?
    return false unless lesson.published?(user)
    return false if I18n.locale != I18n.default_locale && level.spelling_bee?
    return false if I18n.locale != I18n.default_locale && lesson && lesson.spelling_bee?
    return false if locked_or_hidden?(user)
    return false if bonus
    true
  end

  def locked_or_hidden?(user)
    user && (locked?(user) || user.script_level_hidden?(self))
  end

  def locked?(user)
    return false unless lesson.lockable?
    return false if user.authorized_teacher?

    # All levels in a lesson key their lock state off of the last script_level
    # in the lesson, which is an assessment. Thus, to answer the question of
    # whether the nth level is locked, we must look at the last level
    last_script_level = lesson.script_levels.last
    user_level = UserLevel.find_by(
      user: user,
      script: last_script_level.script,
      level: last_script_level.oldest_active_level
    )
    # There will initially be no user_level for the assessment level, at which
    # point it is considered locked. As soon as it gets unlocked, we will always
    # have a user_level
    user_level.nil? || user_level.locked?(lesson)
  end

  def previous_level
    i = script.script_levels.find_index(self)
    return nil if i.nil? || i == 0
    script.script_levels[i - 1]
  end

  def end_of_stage?
    lesson.script_levels.to_a.last == self
  end

  def end_of_script?
    script.script_levels.to_a.last == self
  end

  def long_assessment?
    assessment && level.is_a?(LevelGroup)
  end

  def anonymous?
    return level.properties["anonymous"] == "true"
  end

  def bubble_choice?
    oldest_active_level.is_a? BubbleChoice
  end

  def name
    lesson.localized_name
  end

  def report_bug_url(request)
    message = "Bug in Course #{script.name} lesson #{lesson.absolute_position} Puzzle #{position}\n#{request.url}\n#{request.user_agent}\n"
    "https://support.code.org/hc/en-us/requests/new?&description=#{CGI.escape(message)}"
  end

  def level_display_text
    if level.unplugged?
      I18n.t('unplugged_activity')
    elsif lesson.unplugged?
      position - 1
    else
      position
    end
  end

  def lesson_total
    lesson.script_levels.to_a.size
  end

  def path
    build_script_level_path(self)
  end

  def summarize(include_prev_next=true)
    kind =
      if level.unplugged?
        LEVEL_KIND.unplugged
      elsif assessment
        LEVEL_KIND.assessment
      else
        LEVEL_KIND.puzzle
      end

    ids = level_ids

    levels.each do |l|
      ids.concat(l.contained_levels.map(&:id))
    end

    # Levelbuilders can select if External/
    # Markdown levels should display as Unplugged.
    display_as_unplugged =
      level.unplugged? ||
      level.properties["display_as_unplugged"] == "true"

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
      bonus: bonus,
      display_as_unplugged: display_as_unplugged
    }

    if progression
      summary[:progression] = progression
      localized_progression_name = I18n.t("data.progressions.#{progression}", default: progression)
      summary[:progression_display_name] = localized_progression_name
    end

    if named_level
      summary[:name] = level.display_name || level.name
    end

    if bubble_choice?
      summary[:sublevels] = level.summarize_sublevels(script_level: self)
    end

    if Rails.application.config.levelbuilder_mode
      summary[:key] = level.key
      summary[:skin] = level.try(:skin)
      summary[:videoKey] = level.video_key
      summary[:concepts] = level.summarize_concepts
      summary[:conceptDifficulty] = level.summarize_concept_difficulty
      summary[:assessment] = !!assessment
      summary[:challenge] = !!challenge
    end

    if include_prev_next
      # Add a previous pointer if it's not the obvious (level-1)
      if previous_level
        if previous_level.lesson.absolute_position != lesson.absolute_position
          summary[:previous] = [previous_level.lesson.absolute_position, previous_level.position]
        end
      else
        # This is the first level in the script
        summary[:previous] = false
      end

      # Add a next pointer if it's not the obvious (level+1)
      if end_of_stage?
        if next_level
          summary[:next] = [next_level.lesson.absolute_position, next_level.position]
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

  # Given a script level summary for the last level in a lesson that has already
  # been determined to be a long assessment, returns an array of additional
  # level summaries.
  def self.summarize_extra_puzzle_pages(last_level_summary)
    extra_levels = []
    level_id = last_level_summary[:ids].first
    level = Script.cache_find_level(level_id)
    extra_level_count = level.pages.length - 1
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

  def summarize_as_bonus(user_id = nil)
    perfect = user_id ? UserLevel.find_by(level: level, user_id: user_id)&.perfect? : false
    {
      id: id,
      type: level.type,
      description: level.try(:bubble_choice_description),
      display_name: level.display_name || I18n.t('lesson_extras.bonus_level'),
      thumbnail_url: level.try(:thumbnail_url) || level.try(:solution_image_url),
      url: build_script_level_url(self),
      perfect: perfect,
      maze_summary: {
        map: JSON.parse(level.try(:maze) || '[]'),
        serialized_maze: level.try(:serialized_maze) && JSON.parse(level.try(:serialized_maze)),
        skin: level.try(:skin),
        level: level.summarize_as_bonus.camelize_keys
      }.camelize_keys
    }
  end

  def self.summarize_as_bonus_for_teacher_panel(script, bonus_level_ids, student)
    # Just get the most recently lesson extra they worked on
    lesson_extra_user_level = student.user_levels.where(script: script, level: bonus_level_ids)&.first
    if lesson_extra_user_level
      {
        bonus: true,
        user_id: student.id,
        status: SharedConstants::LEVEL_STATUS.perfect,
        passed: true
      }.merge!(lesson_extra_user_level.attributes)
    else
      {
        bonus: true,
        user_id: student.id,
        passed: false,
        status: SharedConstants::LEVEL_STATUS.not_tried
      }
    end
  end

  # Bring together all the information needed to show the teacher panel on a level
  def summarize_for_teacher_panel(student)
    contained_levels = levels.map(&:contained_levels).flatten
    contained = contained_levels.any?

    levels = if bubble_choice?
               [level.best_result_sublevel(student) || level]
             elsif contained
               contained_levels
             else
               [level]
             end

    user_level = student.last_attempt_for_any(levels, script_id: script_id)
    status = activity_css_class(user_level)
    passed = [SharedConstants::LEVEL_STATUS.passed, SharedConstants::LEVEL_STATUS.perfect].include?(status)

    if user_level
      paired = user_level.paired?

      driver_info = UserLevel.most_recent_driver(script, levels, student)
      driver = driver_info[0] if driver_info

      navigator_info = UserLevel.most_recent_navigator(script, levels, student)
      navigator = navigator_info[0] if navigator_info
    end

    teacher_panel_summary = {
      contained: contained,
      submitLevel: level.properties['submittable'] == 'true',
      paired: paired,
      driver: driver,
      navigator: navigator,
      isConceptLevel: level.concept_level?,
      user_id: student.id,
      passed: passed,
      status: status,
      levelNumber: position,
      assessment: assessment,
      bonus: bonus
    }
    if user_level
      teacher_panel_summary.merge!(user_level.attributes)
    end

    teacher_panel_summary
  end

  def summary_for_feedback
    lesson_num = lesson.lockable ? lesson.absolute_position : lesson.relative_position

    {
      lessonName: lesson.name,
      lessonNum: lesson_num,
      levelNum: position,
      linkToLevel: path,
      unitName: lesson.script.title_for_display
    }
  end

  def self.cache_find(id)
    Script.cache_find_script_level(id)
  end

  def to_param
    position.to_s
  end

  # Is this script_level hidden for the current section, either because the lesson
  # it is contained in is hidden, or the script it is contained in is hidden.
  def hidden_for_section?(section_id)
    return false if section_id.nil?
    !SectionHiddenLesson.find_by(stage_id: lesson.id, section_id: section_id).nil? ||
      !SectionHiddenScript.find_by(script_id: lesson.script.id, section_id: section_id).nil?
  end

  # Given the signed-in user and an optional user that is being viewed
  # (e.g. a student viewed by a teacher), tell us whether we should be hiding
  # prior answers
  def should_hide_survey(user, viewed_user)
    anonymous? && user.try(:teacher?) && !viewed_user.nil? && user != viewed_user
  end
end
