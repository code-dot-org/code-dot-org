# == Schema Information
#
# Table name: lesson_activity_sections
#
#  id                 :integer          not null, primary key
#  lesson_activity_id :integer          not null
#  position           :integer          not null
#  properties         :string(255)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#

class LessonActivitySection < ApplicationRecord
  include SerializedProperties

  belongs_to :lesson_activity

  # TODO(dave): add relationship to levels or script levels

  serialized_attrs %w(
    display_name
    remarks
    slide
    text
    tips
  )
end
