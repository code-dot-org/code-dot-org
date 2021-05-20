class CreateJoinTableLessonResource < ActiveRecord::Migration[5.0]
  def change
    create_join_table :lessons, :resources do |t|
      t.index [:lesson_id, :resource_id]
      t.index [:resource_id, :lesson_id]
    end
  end
end
