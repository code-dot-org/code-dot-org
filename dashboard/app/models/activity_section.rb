# == Schema Information
#
# Table name: activity_sections
#
#  id                 :integer          not null, primary key
#  lesson_activity_id :integer          not null
#  key                :string(255)      not null
#  position           :integer          not null
#  properties         :text(65535)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_activity_sections_on_key                 (key) UNIQUE
#  index_activity_sections_on_lesson_activity_id  (lesson_activity_id)
#

# An ActivitySection represents a part of an activity in a lesson plan.
# An ActivitySection may contain a progression of script levels, or
# may simply contain formatted text and other visual information.
#
# @attr [String] name - The user-visible heading of this section of the activity
# @attr [boolean] remarks - Whether to show the remarks icon
# @attr [String] description - Text describing the activity
# @attr [Array<Hash>] tips - An array of instructional tips to display
class ActivitySection < ApplicationRecord
  include SerializedProperties

  belongs_to :lesson_activity, optional: true
  has_one :script, through: :lesson_activity
  has_one :lesson, through: :lesson_activity

  has_many :script_levels, -> {order(:activity_section_position)}, dependent: :destroy

  serialized_attrs %w(
    name
    duration
    remarks
    description
    tips
    progression_name
  )

  def summarize
    localized_progression_name = Services::I18n::CurriculumSyncUtils.get_localized_property(self, :progression_name) if progression_name
    {
      id: id,
      position: position,
      name: Services::I18n::CurriculumSyncUtils.get_localized_property(self, :name),
      duration: duration,
      remarks: remarks,
      description: Services::I18n::CurriculumSyncUtils.get_localized_property(self, :description),
      tips: localized_tips,
      progressionName: localized_progression_name
    }
  end

  # Translates the content of tips in the adequate format.
  # @attr [Array<Hash>] tips each Hash contains a "type" and a "markdown". get_localized_property returns the same
  # [Array<Hash>] when the locale is the default_locale, otherwise, it returns or Array of to translated "markdown"
  # content [Array<String or NilClass>].
  #
  # @return [Array <Hash>] copy of tips containing translated content
  def localized_tips
    return nil unless tips
    local_tips = Services::I18n::CurriculumSyncUtils.get_localized_property(self, :tips)
    tips_clone = tips.map(&:clone)
    tips_clone.each_with_index do |tip, index|
      tip["markdown"] = local_tips[index].dup unless (local_tips[index] == tip) || local_tips[index].nil?
    end
    tips_clone
  end

  def summarize_for_lesson_show(can_view_teacher_markdown, current_user)
    summary = summarize
    summary[:scriptLevels] = script_levels.map {|sl| sl.summarize_for_lesson_show(can_view_teacher_markdown, current_user)}
    Services::MarkdownPreprocessor.process!(summary[:description])
    summary[:tips]&.each do |tip|
      Services::MarkdownPreprocessor.process!(tip["markdown"])
    end
    summary
  end

  def summarize_for_lesson_edit
    summary = summarize
    summary[:scriptLevels] = script_levels.map(&:summarize_for_lesson_edit)
    summary
  end

  # @param [Array<Hash>] script_levels_data - Data representing script levels
  #   belonging to this activity section.
  def update_script_levels(script_levels_data)
    # use assignment to delete any missing script levels.
    self.script_levels = script_levels_data.map do |sl_data|
      sl = fetch_script_level(sl_data)
      sl.update!(
        # position and chapter will be updated based on activity_section_position later
        activity_section_position: sl_data['activitySectionPosition'] || 0,
        # Unit levels containing anonymous levels must be assessments.
        assessment: sl_data['assessment'] || sl.anonymous?,
        bonus: sl_data['bonus'],
        challenge: !!sl_data['challenge'],
        variants: sl_data['variants'],
        instructor_in_training: !!sl_data['instructor_in_training'],
        progression: progression_name.present? && progression_name
      )
      sl.update_levels(sl_data['levels'] || [])
      sl
    end
  end

  # Used for seeding from JSON. Returns the full set of information needed to
  # uniquely identify this object as well as any other objects it belongs to.
  # If the attributes of this object alone aren't sufficient, and associated objects are needed, then data from
  # the seeding_keys of those objects should be included as well.
  # Ideally should correspond to a unique index for this model's table.
  # See comments on ScriptSeed.seed_from_hash for more context.
  #
  # @param [ScriptSeed::SeedContext] seed_context - contains preloaded data to use when looking up associated objects
  # @return [Hash<String, String>] all information needed to uniquely identify this object across environments.
  def seeding_key(seed_context)
    my_lesson_activity = seed_context.lesson_activities.select {|la| la.id == lesson_activity_id}.first
    raise "No LessonActivity found for #{self.class}: #{my_key}, LessonActivity ID: #{lesson_activity_id}" unless my_lesson_activity
    {
      'activity_section.key': key,
      'lesson_activity.key': my_lesson_activity.key
    }.stringify_keys
  end

  private def fetch_script_level(sl_data)
    # Do not try to find the script level id if it was moved here from another
    # activity section. Create a new one here, and let the old script level be
    # destroyed when we update the other activity section.
    script_level = sl_data['id'] && script_levels.where(id: sl_data['id']).first
    return script_level if script_level

    script_levels.create(
      position: 0,
      activity_section_position: 0,
      lesson: lesson,
      script: lesson.script
    )
  end
end
