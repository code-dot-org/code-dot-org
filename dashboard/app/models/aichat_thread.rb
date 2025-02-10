# == Schema Information
#
# Table name: aichat_threads
#
#  id          :bigint           not null, primary key
#  user_id     :bigint           not null
#  external_id :text(65535)      not null
#  llm_version :text(65535)      not null
#  title       :text(65535)
#  unit_id     :integer
#  level_id    :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_aichat_threads_on_user_id  (user_id)
#
class AichatThread < ApplicationRecord
  belongs_to :user
  has_many :aichat_messages
end
