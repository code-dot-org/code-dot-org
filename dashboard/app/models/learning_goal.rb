# == Schema Information
#
# Table name: learning_goals
#
#  id            :bigint           not null, primary key
#  position      :integer
#  lesson_id     :integer
#  level_id      :integer
#  learning_goal :string(255)
#  ai_enabled    :boolean
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
class LearningGoal < ApplicationRecord
end
