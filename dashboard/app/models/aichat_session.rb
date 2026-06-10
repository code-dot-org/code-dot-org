# == Schema Information
#
# Table name: aichat_sessions
#
#  id                   :bigint           not null, primary key
#  user_id              :integer
#  level_id             :integer
#  script_id            :integer
#  project_id           :integer
#  model_customizations :json
#  messages             :json
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_acs_user_level_script  (user_id,level_id,script_id)
#
class AichatSession < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :confidential,
    user_id: :confidential,
    level_id: :confidential,
    script_id: :confidential,
    project_id: :confidential,
    model_customizations: :confidential,
    messages: :confidential,
    created_at: :confidential,
    updated_at: :confidential,
  )

  belongs_to :user
end
