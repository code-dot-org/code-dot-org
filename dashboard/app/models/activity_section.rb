# == Schema Information
#
# Table name: activity_sections
#
#  id                 :integer          not null, primary key
#  lesson_activity_id :integer          not null
#  seeding_key        :string(255)      not null
#  position           :integer          not null
#  properties         :string(255)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_activity_sections_on_lesson_activity_id  (lesson_activity_id)
#  index_activity_sections_on_seeding_key         (seeding_key) UNIQUE
#

# An ActivitySection represents a part of an activity in a lesson plan.
# An ActivitySection may contain a progression of script levels, or
# may simply contain formatted text and other visual information.
#
# @attr [String] name - The user-visible heading of this section of the activity
# @attr [boolean] remarks - Whether to show the remarks icon
# @attr [boolean] slide - Whether to show the slides icon
# @attr [String] description - Text describing the activity
# @attr [Array<Hash>] tips - An array of instructional tips to display
class ActivitySection < ApplicationRecord
  include SerializedProperties

  belongs_to :lesson_activity
  has_one :lesson, through: :lesson_activity

  has_many :script_levels, -> {order(:activity_section_position)}, dependent: :destroy

  serialized_attrs %w(
    name
    remarks
    slide
    description
    tips
  )

  def summarize_for_edit
    {
      id: id,
      position: position,
      name: name,
      remarks: remarks,
      slide: slide,
      description: description,
      tips: tips,
      scriptLevels: script_levels.map(&:summarize_for_edit)
    }
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
        assessment: !!sl_data['assessment'],
        bonus: !!sl_data['bonus'],
        challenge: !!sl_data['challenge'],
      )
      # TODO(dave): check and update script level variants
      sl.update_levels(sl_data['levels'] || [])
      sl
    end
  end

  private

  def fetch_script_level(sl_data)
    if sl_data['id']
      script_level = script_levels.find(sl_data['id'])
      raise "ScriptLevel id #{sl_data['id']} not found in ActivitySection id #{id}" unless script_level
      return script_level
    end

    script_levels.create(
      position: 0,
      activity_section_position: 0,
      lesson: lesson,
      script: lesson.script
    )
  end
end
