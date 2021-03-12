# == Schema Information
#
# Table name: lessons_vocabularies
#
#  lesson_id     :bigint           not null
#  vocabulary_id :bigint           not null
#
# Indexes
#
#  index_lessons_vocabularies_on_lesson_id_and_vocabulary_id  (lesson_id,vocabulary_id) UNIQUE
#  index_lessons_vocabularies_on_vocabulary_id_and_lesson_id  (vocabulary_id,lesson_id)
#
class LessonsVocabulary < ApplicationRecord
  belongs_to :lesson
  belongs_to :vocabulary

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
    my_vocabulary = seed_context.vocabularies.select {|r| r.id == vocabulary_id}.first
    {
      'lesson.key' => my_lesson.key,
      'vocabulary.key' => my_vocabulary.key
    }.stringify_keys
  end
end
