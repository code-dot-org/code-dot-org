# == Schema Information
#
# Table name: aichat_sessions
#
#  id                   :bigint           not null, primary key
#  user_id              :integer
#  level_id             :integer
#  script_id            :integer
#  project_id           :integer
#  model_customizations :text(65535)
#  messages             :text(65535)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_aichat_sessions_on_user_id  (user_id)
#
class AichatSession < ApplicationRecord
end
