# == Schema Information
#
# Table name: user_level_evaluations
#
#  id                  :bigint           not null, primary key
#  user_id             :integer          not null
#  level_id            :integer          not null
#  script_id           :integer          not null
#  school_year         :string(255)      not null
#  evaluation_criteria :text(65535)
#  ai_evaluation       :text(65535)
#  ai_reasoning        :text(65535)
#  ai_model_version    :string(255)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  code_version        :string(255)
#
# Indexes
#
#  index_user_level_evaluations_on_level_id  (level_id)
#  index_user_level_evaluations_on_user_id   (user_id)
#
class UserLevelEvaluationOld < ApplicationRecord
  self.table_name = 'user_level_evaluations'
  belongs_to :user
  belongs_to :level
end
