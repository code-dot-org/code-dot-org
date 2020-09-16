# == Schema Information
#
# Table name: lesson_activities
#
#  id         :integer          not null, primary key
#  lesson_id  :integer          not null
#  position   :integer          not null
#  properties :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_lesson_activities_on_lesson_id  (lesson_id)
#

class LessonActivity < ApplicationRecord
end
