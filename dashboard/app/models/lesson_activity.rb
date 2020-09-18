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

class LessonActivity < ApplicationRecord
  include SerializedProperties

  belongs_to :lesson
  has_many :activity_sections, dependent: :destroy

  serialized_attrs %w(
    display_name
    duration
  )
end
