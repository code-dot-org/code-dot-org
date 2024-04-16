# == Schema Information
#
# Table name: ai_chat_sessions
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
#  index_ai_chat_sessions_on_user_id  (user_id)
#
class AiChatSession < ApplicationRecord
end
