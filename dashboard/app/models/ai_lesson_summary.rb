# == Schema Information
#
# Table name: ai_lesson_summaries
#
#  id             :bigint           not null, primary key
#  user_id        :integer
#  lesson_id      :integer
#  lesson_summary :text(65535)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  script         :text(65535)
#
# Indexes
#
#  index_ai_lesson_summaries_on_lesson_id              (lesson_id)
#  index_ai_lesson_summaries_on_user_id_and_lesson_id  (user_id,lesson_id)
#
class AiLessonSummary < ApplicationRecord
  belongs_to :user
  belongs_to :lesson
end
