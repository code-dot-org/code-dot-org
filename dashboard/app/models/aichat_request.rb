# == Schema Information
#
# Table name: aichat_requests
#
#  id                   :bigint           not null, primary key
#  user_id              :integer          not null
#  level_id             :integer
#  script_id            :integer
#  project_id           :integer
#  model_customizations :json             not null
#  stored_messages      :json             not null
#  new_message          :json             not null
#  execution_status     :integer          not null
#  response             :text(65535)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
class AichatRequest < ApplicationRecord
  belongs_to :user
  after_initialize :set_default_execution_status

  def set_default_execution_status
    self.execution_status ||= SharedConstants::AI_REQUEST_EXECUTION_STATUS[:NOT_STARTED]
  end
end
