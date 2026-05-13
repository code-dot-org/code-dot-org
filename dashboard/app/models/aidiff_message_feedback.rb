# == Schema Information
#
# Table name: aidiff_message_feedbacks
#
#  id                :bigint           not null, primary key
#  aidiff_message_id :bigint           not null
#  teacher_id        :bigint           not null
#  approval          :boolean
#  flagged           :boolean
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_aidiff_message_feedbacks_on_aidiff_message_id  (aidiff_message_id) UNIQUE
#
class AidiffMessageFeedback < ApplicationRecord
  belongs_to :aidiff_message
end
