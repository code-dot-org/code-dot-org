# == Schema Information
#
# Table name: pd_teachercon1819_registrations
#
#  id                :integer          not null, primary key
#  pd_application_id :integer
#  form_data         :text(65535)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_pd_teachercon1819_registrations_on_pd_application_id  (pd_application_id)
#

class Pd::Teachercon1819Registration < ActiveRecord::Base
  include Pd::Form

  YES = 'Yes'.freeze
  NO = 'No'.freeze
  OTHER = 'Other'.freeze

  def self.options
    {
      dietaryNeeds: [
        'None',
        'Vegetarian',
        'Vegan',
        'Halal',
        'Gluten Free',
        'Food Allergy',
      ],
      liveFarAway: [YES, NO],
      addressState: get_all_states_with_dc.to_h.values,
      howTraveling: [
        'I will drive by myself',
        'I will carpool with another TeacherCon attendee',
        'Flying',
        'Amtrak or regional train service',
        'Public transit (e.g., city bus or light rail)',
      ],
      needHotel: [YES, NO],
      needAda: [YES, NO, 'Other (please explain):'],
    }.freeze
  end

  def self.required_fields
    [
      :contactFirstName,
      :contactLastName,
      :contactRelationship,
      :contactPhone,
      :dietaryNeeds,
      :liveFarAway,
      :howTraveling,
      :needHotel,
    ].freeze
  end
end
