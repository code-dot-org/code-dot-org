# == Schema Information
#
# Table name: learning_goals
#
#  id            :bigint           not null, primary key
#  key           :string(255)      not null
#  position      :integer
#  rubric_id     :integer          not null
#  learning_goal :string(255)
#  ai_enabled    :boolean
#  tips          :text(65535)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_learning_goals_on_rubric_id_and_key  (rubric_id,key) UNIQUE
#
class LearningGoal < ApplicationRecord
end
