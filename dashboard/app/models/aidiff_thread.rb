# == Schema Information
#
# Table name: aidiff_threads
#
#  id              :bigint           not null, primary key
#  user_id         :bigint           not null
#  external_id     :text(65535)      not null
#  llm_version     :text(65535)      not null
#  title           :text(65535)
#  unit_id         :integer
#  lesson_id       :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  session_created :datetime
#  course_id       :integer
#  level_id        :integer
#  context_type    :string(255)
#
# Indexes
#
#  index_aidiff_threads_on_user_id  (user_id)
#
class AidiffThread < ApplicationRecord
  belongs_to :user
  has_many :aidiff_messages

  validates :context_type, inclusion: {in: SharedConstants::AI_DIFF_CONTEXT.values}

  def summarize
    {
      id: id,
      title: title,
      updated_at: updated_at,
      context_type: context_type,
    }
  end

  def summarize_with_messages
    summarize.merge(
      {
        messages: aidiff_messages&.map(&:summarize)
      }
    )
  end
end
