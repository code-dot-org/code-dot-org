# == Schema Information
#
# Table name: lesson_activity_sections
#
#  id                 :integer          not null, primary key
#  lesson_activity_id :integer          not null
#  position           :integer          not null
#  properties         :string(255)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#

class LessonActivitySection < ApplicationRecord
end
