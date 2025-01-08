# == Schema Information
#
# Table name: aichat_events
#
#  id           :bigint           not null, primary key
#  user_id      :integer
#  level_id     :integer
#  script_id    :integer
#  project_id   :integer
#  aichat_event :json
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  request_id   :bigint
#
# Indexes
#
#  index_ace_user_level_script        (user_id,level_id,script_id)
#  index_aichat_events_on_request_id  (request_id)
#
class AichatEvent < ApplicationRecord
  belongs_to :user
end
