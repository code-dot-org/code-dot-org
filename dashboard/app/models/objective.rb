# == Schema Information
#
# Table name: objectives
#
#  id         :integer          not null, primary key
#  properties :text(65535)
#  lesson_id  :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  key        :string(255)      not null
#
# Indexes
#
#  index_objectives_on_key        (key) UNIQUE
#  index_objectives_on_lesson_id  (lesson_id)
#

# An objective represents what students should learn in a lesson
#
# @attr [String] description - What the student should learn
class Objective < ApplicationRecord
  include SerializedProperties

  belongs_to :lesson

  serialized_attrs %w(
    description
  )

  def summarize_for_edit
    {id: id, description: description, key: key}
  end

  def summarize_for_lesson_show
    {
      id: id,
      description: Services::I18n::CurriculumSyncUtils.get_localized_property(self, :description)
    }
  end

  def seeding_key(seed_context)
    my_lesson = seed_context.lessons.select {|l| l.id == lesson_id}.first
    raise "No Lesson found for #{self.class}: #{my_key}, Lesson ID: #{lesson_id}" unless my_lesson

    {
      'lesson.key': my_lesson.key,
      'objective.key': key,
    }.stringify_keys
  end
end
