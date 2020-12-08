# == Schema Information
#
# Table name: lessons_resources
#
#  lesson_id   :integer          not null
#  resource_id :integer          not null
#
# Indexes
#
#  index_lessons_resources_on_lesson_id_and_resource_id  (lesson_id,resource_id) UNIQUE
#  index_lessons_resources_on_resource_id_and_lesson_id  (resource_id,lesson_id)
#
class LessonsResource < ApplicationRecord
end
