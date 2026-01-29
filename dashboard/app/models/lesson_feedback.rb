# == Schema Information
#
# Table name: lesson_feedbacks
#
#  id                 :bigint           not null, primary key
#  teacher_id         :integer
#  student_id         :integer
#  section_id         :bigint
#  lesson_id          :integer
#  saved_feedback     :text(65535)
#  submitted_feedback :text(65535)
#  submitted_at       :datetime
#  resources          :json
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
class LessonFeedback < ApplicationRecord
end
