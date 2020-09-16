# == Schema Information
#
# Table name: activity_sections
#
#  id                 :integer          not null, primary key
#  lesson_activity_id :integer          not null
#  position           :integer          not null
#  properties         :string(255)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#

class ActivitySection < ApplicationRecord
  include SerializedProperties

  belongs_to :activity, class_name: 'LessonActivity', foreign_key: :lesson_activity_id, inverse_of: :activity_sections
  has_one :lesson, through: :activity

  has_many :script_levels

  serialized_attrs %w(
    display_name
    remarks
    slide
    text
    tips
  )
end
