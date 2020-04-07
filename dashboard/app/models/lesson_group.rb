# == Schema Information
#
# Table name: lesson_groups
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  unit_id     :integer
#  user_facing :boolean
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_lesson_groups_on_unit_id  (unit_id)
#

class LessonGroup < ApplicationRecord
  belongs_to :script
  has_many :stages
end
