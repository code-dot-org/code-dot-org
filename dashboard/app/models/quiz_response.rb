# == Schema Information
#
# Table name: quiz_responses
#
#  id             :bigint           not null, primary key
#  level_id       :integer          not null
#  user_id        :integer          not null
#  script_id      :integer
#  response_data  :json             not null
#  submitted_at   :datetime
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
class QuizResponse < ApplicationRecord
  belongs_to :level
  belongs_to :user
end
