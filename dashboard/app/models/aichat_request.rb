# == Schema Information
#
# Table name: aichat_requests
#
#  id                   :bigint           not null, primary key
#  user_id              :integer          not null
#  model_customizations :json             not null
#  stored_messages      :json
#  new_message          :text(65535)      not null
#  status               :integer
#  response             :text(65535)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
class AichatRequest < ApplicationRecord
  belongs_to :user
end
