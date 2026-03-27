# == Schema Information
#
# Table name: lesson_insights
#
#  id           :bigint           not null, primary key
#  lesson_id    :integer
#  student_id   :integer
#  section_id   :integer
#  unit_id      :integer
#  teacher_id   :integer
#  insight_json :text(65535)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_lesson_insights_on_section_id_and_lesson_id_and_student_id  (section_id,lesson_id,student_id) UNIQUE
#
class LessonInsight < ApplicationRecord
  belongs_to :lesson
  belongs_to :student, class_name: 'User'
  belongs_to :section
end
