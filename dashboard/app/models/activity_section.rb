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

  has_many :script_levels, -> {order(:activity_section_position)}

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
    # We can't assign directly to self.script_levels here like we do in other
    # places, because we want to preserve any script levels which exist in the
    # lesson but haven't been associated with an activity section yet.

    script_levels_data.each do |sl_data|
      # TODO(dave): create new script level if id did not previously exist
      next unless sl_data['id']

      sl = ScriptLevel.find(sl_data['id'].to_i)
      unless sl.activity_section == self
        raise "ScriptLevel #{sl_data['id']} is not owned by ActivitySection #{id}"
      end
      sl.update!(
        position: sl_data['position'],
        assessment: !!sl_data['assessment'],
        bonus: !!sl_data['bonus'],
        challenge: !!sl_data['challenge'],
      )

      # TODO(dave): check and update script level variants
    end
  end
end
