# == Schema Information
#
# Table name: aichat_messages
#
#  id               :bigint           not null, primary key
#  aichat_thread_id :bigint           not null
#  external_id      :text(65535)      not null
#  role             :integer          not null
#  content          :text(65535)      not null
#  is_preset        :boolean          not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_aichat_messages_on_aichat_thread_id  (aichat_thread_id)
#
class AichatMessage < ApplicationRecord
  belongs_to :aichat_thread

  enum role: {
    user: 1,
    assistant: 2,
  }
end
