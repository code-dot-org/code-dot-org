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
  belongs_to :lesson
  belongs_to :resource

  # Used for seeding from JSON. Returns the full set of information needed to
  # uniquely identify this object as well as any other objects it belongs to.
  # If the attributes of this object alone aren't sufficient, and associated
  # objects are needed, then data from the seeding_keys of those objects should
  # be included as well. Ideally should correspond to a unique index for this
  # model's table. See comments on ScriptSeed.seed_from_hash for more context.
  #
  # @param [ScriptSeed::SeedContext] seed_context - contains preloaded data to use when looking up associated objects
  # @return [Hash<String, String>] all information needed to uniquely identify this object across environments.
  def seeding_key(seed_context)
    my_lesson = seed_context.lessons.select {|l| l.id == lesson_id}.first
    my_resource = seed_context.resources.select {|r| r.id == resource_id}.first
    {
      'lesson.key' => my_lesson.key,
      'resource.key' => my_resource.key
    }.stringify_keys
  end
end
