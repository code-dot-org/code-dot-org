# == Schema Information
#
# Table name: aichat_message_feedbacks
#
#  id                :bigint           not null, primary key
#  aichat_message_id :bigint           not null
#  teacher_id        :bigint           not null
#  approval          :boolean
#  flagged           :boolean
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_aichat_message_feedbacks_on_aichat_message_id  (aichat_message_id) UNIQUE
#
class AichatMessageFeedback < ApplicationRecord
  belongs_to :aichat_message
end
