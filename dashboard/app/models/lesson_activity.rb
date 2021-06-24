# == Schema Information
#
# Table name: lesson_activities
#
#  id         :integer          not null, primary key
#  lesson_id  :integer          not null
#  key        :string(255)      not null
#  position   :integer          not null
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_lesson_activities_on_key        (key) UNIQUE
#  index_lesson_activities_on_lesson_id  (lesson_id)
#

# A LessonActivity represents a classroom activity within a Lesson
# which consists of one or more ActivitySections.
#
# @attr [String] name - The user-visible name of this activity.
# @attr [Integer] duration - The length of this activity in minutes.
class LessonActivity < ApplicationRecord
  include SerializedProperties

  belongs_to :lesson
  has_one :script, through: :lesson
  has_many :activity_sections, -> {order(:position)}, dependent: :destroy

  serialized_attrs %w(
    name
    duration
  )

  def summarize
    {
      id: id,
      position: position,
      name: name,
      duration: duration,
    }
  end

  def summarize_for_lesson_show(can_view_teacher_markdown)
    summary = summarize
    summary[:activitySections] = activity_sections.map {|as| as.summarize_for_lesson_show(can_view_teacher_markdown)}
    summary[:name] = Services::I18n::CurriculumSyncUtils.get_localized_property(self, :name)
    summary
  end

  def summarize_for_lesson_edit
    summary = summarize
    summary[:activitySections] = activity_sections.map(&:summarize_for_lesson_edit)
    summary
  end

  # Updates this object's activity_sections to match the activity sections
  # represented by the provided data, preserving existing objects in cases where
  # ids match.
  # @param sections [Array<Hash>] - Array of hashes, each representing an
  #   ActivitySection.
  def update_activity_sections(sections)
    return unless sections
    # use assignment to delete any missing activity sections.
    self.activity_sections = sections.map do |section|
      activity_section = fetch_activity_section(section)
      activity_section.update!(
        position: section['position'],
        name: section['name'],
        duration: section['duration'],
        remarks: section['remarks'],
        description: section['description'],
        tips: section['tips'],
        progression_name: section['progressionName']
      )
      activity_section.update_script_levels(section['scriptLevels'] || [])
      activity_section
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
    my_key = {'lesson_activity.key': key}
    my_lesson = seed_context.lessons.select {|l| l.id == lesson_id}.first
    raise "No Lesson found for #{self.class}: #{my_key}, Lesson ID: #{lesson_id}" unless my_lesson
    lesson_seeding_key = my_lesson.seeding_key(seed_context)
    my_key.merge!(lesson_seeding_key) {|key, _, _| raise "Duplicate key when generating seeding_key: #{key}"}
    my_key.stringify_keys
  end

  private

  # Finds the ActivitySection by id, or creates a new one if id is not specified.
  # Do not try to find the activity section if it was moved here from another
  # activity. Create a new one,, and let the old activity section be
  # destroyed when we update the other activity.
  # @param section [Hash] - Hash representing an ActivitySection.
  # @returns [ActivitySection]
  def fetch_activity_section(section)
    if section['id']
      activity_section = activity_sections.find_by(id: section['id'])
      return activity_section if activity_section
    end

    activity_sections.create(
      position: section['position'],
      key: SecureRandom.uuid
    )
  end
end
