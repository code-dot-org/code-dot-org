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
  belongs_to :user
end
