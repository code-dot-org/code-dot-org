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
class LessonInsight < ApplicationRecord
end
