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
#
class AiLessonSummary < ApplicationRecord
  belongs_to :user
  belongs_to :lesson
end
