# == Schema Information
#
# Table name: jit_pl_concepts_lessons
#
#  jit_pl_concept_id :bigint           not null
#  lesson_id         :bigint           not null
#
# Indexes
#
#  index_jit_pl_concepts_lessons_on_jit_pl_concept_id_and_lesson_id  (jit_pl_concept_id,lesson_id) UNIQUE
#  index_jit_pl_concepts_lessons_on_lesson_id_and_jit_pl_concept_id  (lesson_id,jit_pl_concept_id) UNIQUE
#
class JitPlConceptsLesson < ApplicationRecord
  belongs_to :lesson
  belongs_to :jit_pl_concept

  def seeding_key(seed_context)
    my_lesson = seed_context.lessons.find {|l| l.id == lesson_id}
    my_concept = seed_context.jit_pl_concepts.find {|c| c.id == jit_pl_concept_id}
    {
      'lesson.key' => my_lesson.key,
      'jit_pl_concept.name' => my_concept.name,
    }.stringify_keys
  end
end
