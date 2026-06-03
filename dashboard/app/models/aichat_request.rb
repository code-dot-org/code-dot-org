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
# Indexes
#
#  index_aichat_requests_on_created_at        (created_at)
#  index_aichat_requests_on_execution_status  (execution_status)
#
class AichatRequest < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :public,
    user_id: :public,
    level_id: :public,
    script_id: :public,
    project_id: :public,
    model_customizations: :restricted,
    stored_messages: :restricted,
    new_message: :restricted,
    execution_status: :public,
    response: :restricted,
    created_at: :public,
    updated_at: :public,
  )

  belongs_to :user
  after_initialize :set_default_execution_status

  def set_default_execution_status
    self.execution_status ||= SharedConstants::AI_REQUEST_EXECUTION_STATUS[:NOT_STARTED]
  end
end
