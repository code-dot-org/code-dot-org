# == Schema Information
#
# Table name: script_levels
#
#  id                        :integer          not null, primary key
#  script_id                 :integer          not null
#  chapter                   :integer
#  created_at                :datetime
#  updated_at                :datetime
#  stage_id                  :integer
#  position                  :integer
#  assessment                :boolean
#  properties                :text(65535)
#  named_level               :boolean
#  bonus                     :boolean
#  activity_section_id       :integer
#  seed_key                  :string(255)
#  activity_section_position :integer
#
# Indexes
#
#  index_script_levels_on_activity_section_id  (activity_section_id)
#  index_script_levels_on_script_id            (script_id)
#  index_script_levels_on_seed_key             (seed_key) UNIQUE
#  index_script_levels_on_stage_id             (stage_id)
#

require 'cdo/shared_constants'

# This is sort-of-but-not-quite a join table between Scripts and Levels; it's grown to have other functionality.
# It corresponds to the "bubbles" in the UI which represent the levels in a lesson.
#
# A Script has_many ScriptLevels, and a ScriptLevel has_and_belongs_to_many Levels. However, most ScriptLevels
# are only associated with one Level. There are some special cases where they can have multiple Levels, such as
# with the now-deprecated variants feature.
class ScriptLevel < ApplicationRecord
  include SerializedProperties
  include LevelsHelper
  include SharedConstants
  include Rails.application.routes.url_helpers

  belongs_to :script
  belongs_to :lesson, foreign_key: 'stage_id'

  # This field will only be present in scripts which are being edited in the
  # new script / lesson edit GUI.
  belongs_to :activity_section

  has_and_belongs_to_many :levels
  has_many :callouts, inverse_of: :script_level
  has_many :levels_script_levels # join table. we need this association for seeding logic

  validate :anonymous_must_be_assessment
  validate :validate_activity_section_lesson
  validate :validate_activity_section_position

  # Make sure we never create a level that is not an assessment, but is anonymous,
  # as in that case it wouldn't actually be treated as anonymous
  def anonymous_must_be_assessment
    if anonymous? && !assessment
      errors.add(:script_level, "Only assessments can be anonymous in \"#{level.try(:name)}\"")
    end
  end

  def validate_activity_section_lesson
    if activity_section && activity_section.lesson != lesson
      errors.add(:script_level, 'activity_section.lesson does not match lesson')
    end
  end

  def validate_activity_section_position
    if activity_section && !activity_section_position
      errors.add(:script_level, 'activity_section_position is required when activity_section is present')
    end
  end

  serialized_attrs %w(
    variants
    progression
    challenge
    level_keys
  )

  # Chapter values order all the script_levels in a script.
  def self.add_script_levels(script, lesson_group, lesson, raw_script_levels, counters, new_suffix, editor_experiment)
    script_level_position = 0

    raw_script_levels.map do |raw_script_level|
      raw_script_level.symbolize_keys!

      # variants are deprecated. when cloning a script, retain only the first
      # active level in each script level, discarding any variants.
      if new_suffix && raw_script_level[:levels].length > 1
        remove_variants(raw_script_level)
      end

      properties = raw_script_level.delete(:properties) || {}

      levels = Level.add_levels(raw_script_level[:levels], script, new_suffix, editor_experiment)

      script_level_attributes = {
        script_id: script.id,
        stage_id: lesson.id,
        chapter: (counters.chapter += 1),
        position: (script_level_position += 1),
        named_level: raw_script_level[:named_level],
        bonus: raw_script_level[:bonus],
        assessment: raw_script_level[:assessment]
      }
      find_existing_script_level_attributes = script_level_attributes.slice(:script_id, :stage_id)
      script_level = script.script_levels.detect do |sl|
        find_existing_script_level_attributes.all? {|k, v| sl.send(k) == v} &&
          sl.levels.map(&:id).sort == levels.map(&:id).sort
      end || ScriptLevel.create!(script_level_attributes) do |sl|
        sl.levels = levels
      end

      # Generate and store the seed_key, a unique identifier for this script
      # level which should be stable across environments. We'll use this in our
      # new, JSON-based seeding process.
      #
      # Setting this seed_key also serves the purpose of preventing levels from
      # being added to the same script twice via the seed process. If we decide
      # to move away from seed_key, or if we start computing its value in a
      # different way, we should consider adding a different check to ensure
      # that levels within scripts are unique when seeding from .script files.
      seed_context = Services::ScriptSeed::SeedContext.new(script: script, lesson_groups: [lesson_group], lessons: [lesson], lesson_activities: [], activity_sections: [])
      seed_key_data = script_level.seeding_key(seed_context, false)
      script_level_attributes[:seed_key] = HashingUtils.ruby_hash_to_md5_hash(seed_key_data)

      # Preserve the level_keys property. If we detected an existing script
      # level earlier, then the level keys have not changed and it is safe to
      # use the existing level_keys. Otherwise these will be regenerated.
      # These are not strictly needed, because level_keys are only used during
      # seeding. However, this eliminates the problem where level_keys disappear
      # from .script_json files after a script is saved.
      properties[:level_keys] = script_level.get_level_keys(seed_context, true)

      script_level.assign_attributes(script_level_attributes)
      # We must assign properties separately since otherwise, a missing property won't correctly overwrite the current value
      script_level.properties = properties
      script_level.save! if script_level.changed?
      script_level
    end
  end

  def self.remove_variants(raw_script_level)
    first_active_level = raw_script_level[:levels].find do |raw_level|
      variant = raw_script_level[:properties][:variants].try(:[], raw_level[:name])
      !(variant && variant[:active] == false)
    end
    raw_script_level[:levels] = [first_active_level]
    raw_script_level[:properties].delete(:variants)
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
      !end_of_lesson?
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
      script_lesson_extras_path(script.name, (extras_lesson || lesson).relative_position)
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
    return false if lesson && lesson.unplugged_lesson?
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
    user_level.nil? || user_level.show_as_locked?(lesson)
  end

  def previous_level
    i = script.script_levels.find_index(self)
    return nil if i.nil? || i == 0
    script.script_levels[i - 1]
  end

  def end_of_lesson?
    lesson.script_levels.to_a.last == self
  end

  def end_of_script?
    script.script_levels.to_a.last == self
  end

  def long_assessment?
    assessment && level.is_a?(LevelGroup)
  end

  def anonymous?
    return false if level.nil? || level.properties.nil?

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
    elsif lesson.unplugged_lesson?
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

  def summarize(include_prev_next=true, for_edit: false)
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

    summary = {
      ids: ids.map(&:to_s),
      activeId: oldest_active_level.id.to_s,
      position: position,
      kind: kind,
      icon: level.icon,
      is_concept_level: level.concept_level?,
      title: level_display_text,
      url: build_script_level_url(self),
      freePlay: level.try(:free_play) == "true",
      bonus: bonus,
      display_as_unplugged: level.display_as_unplugged?
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

    if for_edit
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
      if end_of_lesson?
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

  def summarize_for_lesson_show(can_view_teacher_markdown)
    summary = summarize
    summary[:id] = id.to_s
    summary[:scriptId] = script_id
    summary[:levels] = levels.map {|l| l.summarize_for_lesson_show(can_view_teacher_markdown)}
    summary
  end

  def summarize_for_lesson_edit
    summary = summarize(for_edit: true)
    summary[:id] = id.to_s
    summary[:activitySectionPosition] = activity_section_position
    summary[:levels] = levels.map do |level|
      {
        id: level.id.to_s,
        name: level.name,
        url: edit_level_path(id: level.id)
      }
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
      new_level[:page_number] = page_index + 1
      new_level[:url] << "/page/#{page_index + 1}"
      new_level[:position] = last_level_summary[:position] + page_index
      new_level[:title] = last_level_summary[:position] + page_index
      extra_levels << new_level
    end
    extra_levels
  end

  def summarize_as_bonus
    localized_level_description = I18n.t(level.name, scope: [:data, :bubble_choice_description], default: level.bubble_choice_description)
    localized_level_display_name = I18n.t(level.name, scope: [:data, :display_name], default: level.display_name)
    {
      id: id.to_s,
      level_id: level.id.to_s,
      type: level.type,
      description: localized_level_description,
      display_name: localized_level_display_name || I18n.t('lesson_extras.bonus_level'),
      thumbnail_url: level.try(:thumbnail_url) || level.try(:solution_image_url),
      url: build_script_level_url(self),
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
        id: lesson_extra_user_level.id.to_s,
        bonus: true,
        user_id: student.id,
        status: SharedConstants::LEVEL_STATUS.perfect,
        passed: true
      }.merge!(lesson_extra_user_level.attributes)
    elsif bonus_level_ids.count == 0
      {
        # Some lessons have a lesson extras option without any bonus levels. In
        # these cases, they just display previous lesson challenges. These should
        # be displayed as "perfect." Example level: /s/express-2020/lessons/28/extras
        id: '-1',
        bonus: true,
        user_id: student.id,
        passed: true,
        status: SharedConstants::LEVEL_STATUS.perfect
      }
    else
      {
        id: bonus_level_ids.first.to_s,
        bonus: true,
        user_id: student.id,
        passed: false,
        status: SharedConstants::LEVEL_STATUS.not_tried
      }
    end
  end

  def contained_levels
    levels.map(&:contained_levels).flatten
  end

  # Returns the user_level whose status will determine the bubble state for the
  # script_level
  def get_user_level_for_bubble(student)
    levels = if bubble_choice?
               keep_working_level = level.keep_working_sublevel(student, script)
               best_result_level = level.best_result_sublevel(student, script)
               [keep_working_level || best_result_level || level]
             elsif contained_levels.any?
               contained_levels
             else
               [level]
             end

    student.last_attempt_for_any(levels, script_id: script_id)
  end

  # Bring together all the information needed to show the teacher panel on a level
  def summarize_for_teacher_panel(student, teacher = nil)
    user_level = get_user_level_for_bubble(student)
    status = activity_css_class(user_level)
    passed = [SharedConstants::LEVEL_STATUS.passed, SharedConstants::LEVEL_STATUS.perfect].include?(status)

    if user_level
      paired = user_level.paired?

      driver_info = UserLevel.most_recent_driver(script, levels, student)
      driver = driver_info[0] if driver_info

      navigator_info = UserLevel.most_recent_navigator(script, levels, student)
      navigator = navigator_info[0] if navigator_info
    end

    if teacher.present? && user_level.present?
      feedback = TeacherFeedback.get_latest_feedback_given(student.id, user_level.level_id, teacher.id, script_id)
    end

    teacher_panel_summary = {
      id: level.id.to_s,
      contained: contained_levels.any?,
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
      bonus: bonus,
      teacherFeedbackReivewState: feedback&.review_state
    }

    if user_level
      # note: level.id gets replaced with user_level.id here
      teacher_panel_summary.merge!(user_level.attributes)
    end

    teacher_panel_summary
  end

  def summary_for_feedback
    lesson_num = lesson.numbered_lesson? ? lesson.relative_position : lesson.absolute_position

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

  # Used for seeding from JSON. Returns the full set of information needed to
  # uniquely identify this object as well as any other objects it belongs to.
  # If the attributes of this object alone aren't sufficient, and associated objects are needed, then data from
  # the seeding_keys of those objects should be included as well.
  # Ideally should correspond to a unique index for this model's table.
  # See comments on ScriptSeed.seed_from_hash for more context.
  #
  # @param [ScriptSeed::SeedContext] seed_context - contains preloaded data to use when looking up associated objects
  # @param [boolean] use_existing_level_keys - If true, use existing information in the level_keys property if available
  #   instead of re-querying associated levels. We want to reuse this data during seeding, but not during serialization.
  # @return [Hash<String, String>] all information needed to uniquely identify this object across environments.
  def seeding_key(seed_context, use_existing_level_keys = true)
    my_key = {
      'script_level.level_keys': get_level_keys(seed_context, use_existing_level_keys)
    }

    my_lesson = seed_context.lessons.select {|l| l.id == stage_id}.first
    raise "No Lesson found for #{self.class}: #{my_key}, Lesson ID: #{stage_id}" unless my_lesson
    lesson_seeding_key = my_lesson.seeding_key(seed_context)
    my_key.merge!(lesson_seeding_key) {|key, _, _| raise "Duplicate key when generating seeding_key: #{key}"}

    # Activity Section must be optional for now, so that we can still compute
    # the seed key for legacy scripts. Currently, this is necessary because we
    # output .script_json files for all legacy scripts, even though those aren't
    # going to be used for seeding yet.
    my_activity_section = seed_context.activity_sections.select {|s| s.id == activity_section_id}.first

    my_key['activity_section.key'] = my_activity_section.key if my_activity_section

    my_key.stringify_keys
  end

  # Gets keys of the Levels associated with this ScriptLevel, in order.
  #
  # Because getting level keys can be expensive (1-2 queries per Level, depending on whether it's a Blockly level),
  # we prefer to use already loaded data instead of re-querying for it when possible. However, we shouldn't do so
  # during serialization, to eliminate the risk that the data is out of sync.
  #
  # @param [boolean] use_existing_level_keys - If true, use existing information in the level_keys property if available
  #   instead of re-querying associated levels. We want to reuse this data during seeding, but not during serialization.
  # @return [Array[String]] the keys for the Level objects associated with this ScriptLevel.
  def get_level_keys(seed_context, use_existing_level_keys = true)
    # Use the level_keys property if it's there, unless we specifically want to re-query the level keys.
    # This property is set during seeding.
    return self.level_keys if use_existing_level_keys && !self.level_keys.nil_or_empty? # rubocop:disable Style/RedundantSelf

    if levels.loaded?
      my_levels = levels
    else
      # TODO: this series of in-memory filters is probably inefficient
      my_levels_script_levels = seed_context.levels_script_levels.select {|lsl| lsl.script_level_id == id}
      my_levels = my_levels_script_levels.map do |lsl|
        level = seed_context.levels.select {|l| l.id == lsl.level_id}.first
        raise "No level found for #{lsl}" unless level
        level
      end
      raise "No levels found for #{inspect}" if my_levels.nil_or_empty?
    end
    my_levels.sort_by(&:id).map(&:key)
  end

  # @param [Array<Hash>] levels_data - Array of hashes each representing a level
  def update_levels(levels_data)
    levels = levels_data.map do |level_data|
      Level.find(level_data['id'])
    end

    # Script levels containing anonymous levels must be assessments.
    if levels.any? {|l| l.properties["anonymous"] == "true"}
      self.assessment = true
      save! if changed?
    end
    self.levels = levels
  end

  def add_variant(new_level)
    raise "can only be used on migrated scripts" unless script.is_migrated
    raise "expected 1 existing level but found: #{levels.map(&:key)}" unless levels.count == 1
    raise "expected empty variants property but found #{variants}" if variants
    raise "cannot add variant to non-custom level" unless levels.first.level_num == 'custom'
    existing_level = levels.first

    levels << new_level
    update!(
      level_keys: levels.map(&:key),
      variants: {
        existing_level.name => {"active" => false}
      }
    )
    if Rails.application.config.levelbuilder_mode
      script.write_script_json
    end
  end
end
