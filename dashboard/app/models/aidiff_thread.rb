# == Schema Information
#
# Table name: aidiff_threads
#
#  id              :bigint           not null, primary key
#  user_id         :bigint           not null
#  external_id     :text(16777215)   not null
#  llm_version     :text(16777215)   not null
#  title           :text(16777215)
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
  export_to_analytics

  data_classification(
    id: :restricted,
    user_id: :restricted,
    external_id: :restricted,
    llm_version: :restricted,
    title: :restricted,
    unit_id: :restricted,
    lesson_id: :restricted,
    created_at: :restricted,
    updated_at: :restricted,
    session_created: :restricted,
    course_id: :restricted,
    level_id: :restricted,
    context_type: :restricted,
  )

  belongs_to :user
  has_one :aidiff_artifact
  has_many :aidiff_messages, dependent: :destroy

  validates :context_type, inclusion: {in: SharedConstants::AI_DIFF_CONTEXT.values}

  def summarize(first_message: aidiff_messages.first, has_artifact: !aidiff_artifact.nil?)
    {
      id: id,
      title: generate_title(first_message),
      updated_at: updated_at,
      context_type: context_type,
      has_artifact: has_artifact
    }
  end

  # Same as calling summarize on each thread, in three queries instead of
  # two per thread.
  def self.summarize_all(threads)
    threads = threads.to_a
    thread_ids = threads.map(&:id)
    first_message_ids = AidiffMessage.where(aidiff_thread_id: thread_ids).group(:aidiff_thread_id).minimum(:id)
    first_messages = AidiffMessage.where(id: first_message_ids.values).index_by(&:aidiff_thread_id)
    thread_ids_with_artifact = AidiffArtifact.where(aidiff_thread_id: thread_ids).distinct.pluck(:aidiff_thread_id).to_set
    threads.map do |thread|
      thread.summarize(
        first_message: first_messages[thread.id],
        has_artifact: thread_ids_with_artifact.include?(thread.id)
      )
    end
  end

  def summarize_with_messages
    summarize.merge(
      {
        messages: aidiff_messages&.map(&:summarize),
        artifact: aidiff_artifact&.summarize
      }
    )
  end

  def generate_title(msg = aidiff_messages.first)
    msg_title = msg&.is_preset && msg&.preset_chip_text ? msg&.preset_chip_text : msg&.content
    msg_title
  end
end
