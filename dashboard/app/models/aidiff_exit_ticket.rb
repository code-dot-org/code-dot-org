# == Schema Information
#
# Table name: aidiff_artifacts
#
#  id               :bigint           not null, primary key
#  type             :string(255)
#  content          :json
#  title            :string(255)
#  aidiff_thread_id :bigint           not null
#  user_id          :bigint           not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_aidiff_artifacts_on_aidiff_thread_id  (aidiff_thread_id)
#  index_aidiff_artifacts_on_user_id           (user_id)
#
class AidiffExitTicket < AidiffArtifact
  def self.to_markdown(json)
    json['comment'] + "\n\n***\n\n" +
      json['exit_ticket_items'].map.with_index do |item, i|
        "**Question #{i+1}:** #{item['question']}\n\n**Answer:** #{item['answer']}\n"
      end.join("\n\n***\n\n")
  end
end
