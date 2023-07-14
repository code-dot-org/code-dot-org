# == Schema Information
#
# Table name: learning_goals
#
#  id            :bigint           not null, primary key
#  key           :string(255)
#  position      :integer
#  rubric_id     :integer
#  learning_goal :string(255)
#  ai_enabled    :boolean
#  tips          :text(65535)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
class LearningGoal < ApplicationRecord
end
