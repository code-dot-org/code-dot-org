# == Schema Information
#
# Table name: lesson_insights
#
#  id           :bigint           not null, primary key
#  lesson_id    :integer          not null
#  student_id   :integer          not null
#  section_id   :integer          not null
#  unit_id      :integer          not null
#  insight_json :text(65535)      not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_lesson_insights_on_section_id_unit_id_lesson_id_student_id  (section_id,unit_id,lesson_id,student_id) UNIQUE
#
class LessonInsight < ApplicationRecord
  belongs_to :lesson
  belongs_to :student, class_name: 'User'
end
