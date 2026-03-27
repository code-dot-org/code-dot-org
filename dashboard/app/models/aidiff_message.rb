# == Schema Information
#
# Table name: aidiff_messages
#
#  id                      :bigint           not null, primary key
#  aidiff_thread_id        :bigint           not null
#  external_id             :text(16777215)   not null
#  role                    :integer          not null
#  content                 :text(16777215)   not null
#  is_preset               :boolean          not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  preset_chip_text        :text(16777215)
#  raw_content             :text(16777215)
#  source_links            :json
#  is_artifact_candidate   :boolean          default(FALSE)
#  artifact_candidate_type :string(255)
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

  def summarize
    {
      id: id,
      role: role,
      content: AidiffArtifact.to_markdown(content, artifact_candidate_type),
      updated_at: updated_at,
      is_preset: is_preset,
      preset_chip_text: preset_chip_text,
      is_artifact_candidate: is_artifact_candidate,
      artifact_candidate_type: artifact_candidate_type,
    }
  end
end
