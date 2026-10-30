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
#  lesson_id    :integer
#
# Indexes
#
#  index_ace_lesson_user              (lesson_id,user_id)
#  index_ace_user_level_script        (user_id,level_id,script_id)
#  index_ace_user_level_script_id     (user_id,level_id,script_id,id)
#  index_ace_user_project             (user_id,project_id)
#  index_ace_user_project_id          (user_id,project_id,id)
#  index_aichat_events_on_created_at  (created_at)
#  index_aichat_events_on_request_id  (request_id)
#
class AichatEvent < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :restricted,
    user_id: :restricted,
    level_id: :restricted,
    script_id: :restricted,
    project_id: :restricted,
    aichat_event: :restricted,
    created_at: :restricted,
    updated_at: :restricted,
    request_id: :restricted,
    lesson_id: :restricted,
  )

  belongs_to :user
end
