# == Schema Information
#
# Table name: rubrics
#
#  id         :bigint           not null, primary key
#  lesson_id  :integer
#  level_id   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class Rubric < ApplicationRecord
  has_many :learning_goals, -> {order(:position)}, dependent: :destroy
  belongs_to :level
  belongs_to :lesson
end
