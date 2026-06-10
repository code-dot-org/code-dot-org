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
  export_to_analytics

  data_classification(
    id: :confidential,
    aidiff_message_id: :confidential,
    teacher_id: :confidential,
    approval: :confidential,
    flagged: :confidential,
    created_at: :confidential,
    updated_at: :confidential,
  )

  belongs_to :aidiff_message
end
