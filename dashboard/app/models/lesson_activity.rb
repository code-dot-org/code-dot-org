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

  def summarize_for_lesson_show
    summary = summarize
    summary[:activitySections] = activity_sections.map(&:summarize_for_lesson_show)
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
