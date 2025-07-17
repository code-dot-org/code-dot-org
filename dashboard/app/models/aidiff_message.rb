# == Schema Information
#
# Table name: aidiff_messages
#
#  id               :bigint           not null, primary key
#  aidiff_thread_id :bigint           not null
#  external_id      :text(65535)      not null
#  role             :integer          not null
#  content          :text(65535)      not null
#  is_preset        :boolean          not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  preset_chip_text :text(65535)
#  raw_content      :text(65535)
#  source_links     :json
#
# Indexes
#
#  index_aidiff_messages_on_aidiff_thread_id  (aidiff_thread_id)
#
class AidiffMessage < ApplicationRecord
  belongs_to :aidiff_thread
  has_one :aidiff_message_feedback, dependent: :destroy

  enum role: {
    user: 1,
    assistant: 2,
  }
end
