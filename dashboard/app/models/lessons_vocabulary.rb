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
end
