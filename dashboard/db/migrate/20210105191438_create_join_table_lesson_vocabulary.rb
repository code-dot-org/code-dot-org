class CreateJoinTableLessonVocabulary < ActiveRecord::Migration[5.2]
  def change
    create_join_table :lessons, :vocabularies do |t|
      t.index [:lesson_id, :vocabulary_id], unique: true
      t.index [:vocabulary_id, :lesson_id]
    end
  end
end
