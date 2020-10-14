# == Schema Information
#
# Table name: lesson_activities
#
#  id          :integer          not null, primary key
#  lesson_id   :integer          not null
#  seeding_key :string(255)      not null
#  position    :integer          not null
#  properties  :string(255)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_lesson_activities_on_lesson_id    (lesson_id)
#  index_lesson_activities_on_seeding_key  (seeding_key) UNIQUE
#

# A LessonActivity represents a classroom activity within a Lesson
# which consists of one or more ActivitySections.
#
# @attr [String] name - The user-visible name of this activity.
# @attr [Integer] duration - The length of this activity in minutes.
class LessonActivity < ApplicationRecord
  include SerializedProperties

  belongs_to :lesson
  has_many :activity_sections, dependent: :destroy

  serialized_attrs %w(
    name
    duration
  )

  def summarize_for_edit
    {
      id: id,
      position: position,
      name: name,
      duration: duration,
      activitySections: activity_sections.map(&:summarize_for_edit)
    }
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
        remarks: section['remarks'],
        slide: section['slide'],
        description: section['description'],
        tips: section['tips']
      )
      activity_section.update_script_levels(section['scriptLevels'] || [])
      activity_section
    end
  end

  private

  # Finds the ActivitySection by id, or creates a new one if id is not specified.
  # @param section [Hash] - Hash representing an ActivitySection.
  # @returns [ActivitySection]
  def fetch_activity_section(section)
    if section['id']
      activity_section = activity_sections.find(section['id'])
      raise "ActivitySection id #{section['id']} not found in LessonActivity id #{id}" unless activity_section
      return activity_section
    end

    activity_sections.create(
      position: section['position'],
      seeding_key: SecureRandom.uuid
    )
  end
end
